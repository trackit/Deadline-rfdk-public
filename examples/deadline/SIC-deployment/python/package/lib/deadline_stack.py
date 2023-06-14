# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

from dataclasses import dataclass
from aws_cdk import (
    Duration,
    RemovalPolicy,
    Stack,
    StackProps,
    Tags,
)
from aws_cdk.aws_ec2 import (
    CfnRoute,
    CfnVPCPeeringConnection,
    IMachineImage,
    InstanceType,
    MachineImage,
    Peer,
    Port,
    SecurityGroup,
    SubnetConfiguration,
    SubnetType,
    Vpc,
)
from aws_cdk.aws_iam import (
    Group,
    ManagedPolicy,
    PolicyDocument,
    PolicyStatement,
    Role,
    ServicePrincipal,
)
from aws_cdk.aws_elasticloadbalancingv2 import (
    ApplicationProtocol,
)
from aws_cdk.aws_route53 import (
    PrivateHostedZone,
)

from aws_cdk.aws_route53resolver import (
    CfnResolverEndpoint,
    CfnResolverRule,
    CfnResolverRuleAssociation,
)

from aws_cdk.aws_s3 import (
    Bucket,
)

from aws_rfdk.deadline import (
    AwsCustomerAgreementAndIpLicenseAcceptance,
    ConfigureSpotEventPlugin,
    InstanceUserDataProvider,
    RenderQueue,
    RenderQueueExternalTLSProps,
    RenderQueueHostNameProps,
    RenderQueueTrafficEncryptionProps,
    Repository,
    RepositoryRemovalPolicies,
    SpotEventPluginFleet,
    SpotEventPluginSettings,
    Stage,
    ThinkboxDockerImages,
    ThinkboxDockerRecipes,
    UsageBasedLicense,
    UsageBasedLicensing,
    VersionQuery
)
from aws_rfdk import (
    DistinguishedName,
    SessionManagerHelper,
    X509CertificatePem,
)
from aws_cdk.aws_secretsmanager import(
    Secret
)
from constructs import (
    Construct
)
from typing import (
    List
)

@dataclass
class DeadlineStackProps(StackProps):
    """
    Properties for DeadlineStack
    """
    # The aws region Deadline is deployed into
    aws_region: str
    # The path to the directory where the staged Deadline Docker recipes are.
    docker_recipes_stage_path: str
    # The IMachineImage to use for Workers (needs Deadline Client installed).
    worker_machine_image: IMachineImage
    # Whether the DeadlineResourceTrackerAccessRole IAM role required by Deadline's Resource Tracker should be created in this CDK app.
    create_resource_tracker_role: bool
    # SIC vpc id
    sic_vpc_id: str
    # SIC vpc cidr
    sic_vpc_cidr: str
    # Deadline vpc to create CIDR
    vpc_cidr: str
    # SIC workstation subnet CIDR
    sic_workstation_subnet_cidr: str
    # S3 bucket for workers
    s3_bucket_workers: str
    # Spot instance fleet configuration
    fleet_config: dict
    # Secret domain arn
    secret_domain_arn: str
    # AD domain name
    ad_domain_name: str
    # AD domain ip 1
    ad_domain_ip_1: str
    # AD domain ip 2
    ad_domain_ip_2: str
    # UBL support
    ubl_support: bool
    # UBL certificate secret arn
    ubl_certificate_secret_arn: str
    # deadline version
    deadline_version: str
    # ubl licenses
    ubl_licenses: List[UsageBasedLicense]


# USER DATA Handling
class UserDataProvider(InstanceUserDataProvider):
    def __init__(self, scope: Construct, stack_id: str, *, props: DeadlineStackProps, os_key: int, user_data_script=None, **kwargs):
        super().__init__(scope, stack_id, **kwargs)
        self.props=props
        self.os_key=os_key
        self.user_data_script=user_data_script
        
    def pre_render_queue_configuration(self, host) -> None:
        host.user_data.add_commands("echo preRenderQueueConfiguration")
        if self.os_key == 1:
            bucket_key_script="deadline/workers_linux.sh"
        else:
            bucket_key_script="deadline/workers_windows.ps1"
        license_bucket = Bucket.from_bucket_attributes(
            self,
            'license_bucket',
            bucket_name= self.props.s3_bucket_workers,
            )
        local_path = host.user_data.add_s3_download_command(
            bucket=license_bucket,
            bucket_key=bucket_key_script
        )
        host.user_data.add_execute_file_command(file_path=local_path)
        if self.user_data_script is not None:
            user_data_path = host.user_data.add_s3_download_command(
            bucket=license_bucket,
            bucket_key=f'deadline/{self.user_data_script}'
            )
            host.user_data.add_execute_file_command(file_path=user_data_path)
    def pre_worker_configuration(self, host) -> None:
        if self.os_key == 1:
            host.user_data.add_commands("/opt/Thinkbox/Deadline10/bin/deadlinecommand -SetIniFileSetting ProxyRoot0 'renderqueue.deadline.internal:4433'")
            host.user_data.add_commands("/opt/Thinkbox/Deadline10/bin/deadlinecommand -SetIniFileSetting ProxyRoot 'renderqueue.deadline.internal:4433'")
        else:
            host.user_data.add_commands(r"$DEADLINE_PATH = 'C:\Program Files\Thinkbox\Deadline10\bin'")
            host.user_data.add_commands("pushd $DEADLINE_PATH")
            host.user_data.add_commands(".\deadlinecommand.exe -SetIniFileSetting ProxyRoot0 'renderqueue.deadline.internal:4433'")
            host.user_data.add_commands(".\deadlinecommand.exe -SetIniFileSetting ProxyRoot 'renderqueue.deadline.internal:4433'")
            pass 

class DeadlineStack(Stack):
    """
    This stack contains all the constructs required to set the Spot Event Plugin Configuration.
    """

    def __init__(self, scope: Construct, stack_id: str, *, props: DeadlineStackProps, **kwargs):
        """
        Initialize a new instance of DeadlineStack
        :param scope: The scope of this construct.
        :param stack_id: The ID of this construct.
        :param props: The properties for this construct.
        :param kwargs: Any kwargs that need to be passed on to the parent class.
        """
        super().__init__(scope, stack_id, **kwargs)
        

        # Create Cloud9 IAM group
        cloud9IamGroup= Group(self, "Cloud9Admin")
        cloud9IamGroup.add_managed_policy(ManagedPolicy.from_aws_managed_policy_name('AWSCloud9Administrator'))


         # The VPC that all components of the render farm will be created in.
        vpc = Vpc(
            self,
            'Vpc',
            max_azs=99,
            nat_gateways=1,
            cidr = props.vpc_cidr,
            subnet_configuration = [SubnetConfiguration(subnet_type=SubnetType.PUBLIC,
                                                      cidr_mask=28,
                                                      name="public"),
                                    SubnetConfiguration(subnet_type=SubnetType.PRIVATE_WITH_EGRESS,
                                                      cidr_mask=19,
                                                      name="render-")
                                    ]
        )

        # create a peering connection
        peer = CfnVPCPeeringConnection(
            self,
            "DeadlineSICPeeringConnection",
            vpc_id=vpc.vpc_id,
            peer_vpc_id=props.sic_vpc_id,
        )

        # Update route table in rfdk vpc
        for i, subnet in enumerate(vpc.private_subnets):
            CfnRoute(self, 'PeerRoute' + str(i),
                route_table_id=subnet.route_table.route_table_id,
                destination_cidr_block=props.sic_vpc_cidr,
                vpc_peering_connection_id=peer.ref
            )
      
        # security group for resolver endpoint
        worker_resolver_endpoint_sg = SecurityGroup(
                self,
                "Deadline_workers_to_ad_sg",
                vpc=vpc,
                allow_all_outbound=True,
                description="Deadline_workers_to_ad",
                security_group_name="deadline_worker_to_ad"
                
            )
        worker_resolver_endpoint_sg.add_ingress_rule(
                peer=Peer.ipv4(props.vpc_cidr),
                connection=Port.tcp(53),
                description="allow workers to connect to studio active directory"
            )
        
        
        # Create resolver endpoint so workers can connect to VPC
        workers_resolver_endpoint = CfnResolverEndpoint(self, "Deadline_workers_to_ad_re",
            direction="OUTBOUND",
            ip_addresses=[CfnResolverEndpoint.IpAddressRequestProperty(
                subnet_id=vpc.select_subnets(subnet_type=SubnetType.PRIVATE_WITH_EGRESS).subnet_ids[0]
            ),
            CfnResolverEndpoint.IpAddressRequestProperty(
                subnet_id=vpc.select_subnets(subnet_type=SubnetType.PRIVATE_WITH_EGRESS).subnet_ids[1]
            )],
            security_group_ids=[worker_resolver_endpoint_sg.security_group_id],
            name="Deadline_workers_to_ad",
        )
        workers_resolver_rule = CfnResolverRule(self, "Deadline_workers_to_ad_r",
            domain_name=props.ad_domain_name,
            rule_type="FORWARD",
            name="connection_to_AD",
            resolver_endpoint_id=workers_resolver_endpoint.ref,
            target_ips=[CfnResolverRule.TargetAddressProperty(
                ip=props.ad_domain_ip_1,
                port="53"
            ),
            CfnResolverRule.TargetAddressProperty(
                ip=props.ad_domain_ip_2,
                port="53"
            ),
            ]
        )
        cfn_resolver_rule_association = CfnResolverRuleAssociation(self, "Deadline_workers_to_ad_ra",
            resolver_rule_id=workers_resolver_rule.ref,
            vpc_id=vpc.vpc_id,
            name="Deadline_workers_to_ad"
        )
        # create worker IAM role
        
        fleet_instance_role = Role(
                self,
                'FleetRole',
                role_name= 'Deadline-Fleet-Instance-Role',
                assumed_by=ServicePrincipal('ec2.amazonaws.com'),
                managed_policies= [ManagedPolicy.from_aws_managed_policy_name('AWSThinkboxDeadlineSpotEventPluginWorkerPolicy')],
                inline_policies= {
                    "s3_licence_access": PolicyDocument(
                        statements=[
                            PolicyStatement(
                                actions=["s3:GetObject"],
                                resources=["arn:aws:s3:::"+props.s3_bucket_workers+"/*"]
                            )
                        ]
                    ),
                    "read_ad_credentials": PolicyDocument(
                        statements=[
                            PolicyStatement(
                                actions=["secretsmanager:GetSecretValue"],
                                resources=[props.secret_domain_arn]
                            )
                        ]
                    )
                    
                },
            )
            
        recipes = ThinkboxDockerRecipes(
            self,
            'Image',
            stage=Stage.from_directory(props.docker_recipes_stage_path),
        )

        repository = Repository(
            self,
            'Repository',
            vpc=vpc,
            version=recipes.version,
            repository_installation_timeout=Duration.minutes(20),
            # TODO - Evaluate deletion protection for your own needs. These properties are set to RemovalPolicy.DESTROY
            # to cleanly remove everything when this stack is destroyed. If you would like to ensure
            # that these resources are not accidentally deleted, you should set these properties to RemovalPolicy.RETAIN
            # or just remove the removal_policy parameter.
            removal_policy=RepositoryRemovalPolicies(
                database=RemovalPolicy.DESTROY,
                filesystem=RemovalPolicy.DESTROY,
            ),
        )

        host = 'renderqueue'
        zone_name = 'deadline.internal'

        # Internal DNS zone for the VPC.
        dns_zone = PrivateHostedZone(
            self,
            'DnsZone',
            vpc=vpc,
            zone_name=zone_name,
        )

        ca_cert = X509CertificatePem(
            self,
            'RootCA',
            subject=DistinguishedName(
                cn='SampleRootCA',
            ),
        )

        server_cert = X509CertificatePem(
            self,
            'RQCert',
            subject=DistinguishedName(
                cn=f'{host}.{dns_zone.zone_name}',
                o='RFDK-Sample',
                ou='RenderQueueExternal',
            ),
            signing_certificate=ca_cert,
        )

        render_queue = RenderQueue(
            self,
            'RenderQueue',
            vpc=vpc,
            version=recipes.version,
            images=recipes.render_queue_images,
            repository=repository,
            # TODO - Evaluate deletion protection for your own needs. This is set to false to
            # cleanly remove everything when this stack is destroyed. If you would like to ensure
            # that this resource is not accidentally deleted, you should set this to true.
            deletion_protection=False,
            hostname=RenderQueueHostNameProps(
                hostname=host,
                zone=dns_zone,
            ),
            traffic_encryption=RenderQueueTrafficEncryptionProps(
                external_tls=RenderQueueExternalTLSProps(
                    rfdk_certificate=server_cert,
                ),
                internal_protocol=ApplicationProtocol.HTTPS,
            ),
        )
        render_queue.connections.allow_default_port_from(Peer.ipv4(props.sic_workstation_subnet_cidr))

        if props.create_resource_tracker_role:
            # Creates the Resource Tracker Access role. This role is required to exist in your account so the resource tracker will work properly
            Role(
                self,
                'ResourceTrackerRole',
                assumed_by=ServicePrincipal('lambda.amazonaws.com'),
                managed_policies= [ManagedPolicy.from_aws_managed_policy_name('AWSThinkboxDeadlineResourceTrackerAccessPolicy')],
                role_name= 'DeadlineResourceTrackerAccessRole',
            )
        
        # Spot fleet Security group
        worker_fleet_sg = SecurityGroup(
                self,
                "Deadline_workers_fleet",
                vpc=vpc,
                allow_all_outbound=True,
                description="Deadline_workers_fleet",
                security_group_name="deadline_workers_fleet"
                
            )
        worker_fleet_sg.add_ingress_rule(
                peer=Peer.ipv4(props.sic_vpc_cidr),
                connection=Port.all_traffic(),
                description="allow fleet workers to access licence server or workstation to be able to check worker logs"
            )
        
        # iterate through props.fleet_config dict
        spot_fleet=[];
        for i, fleet in props.fleet_config.items():
            # determine worker AMI OS
            if fleet["is_linux"] == 1:
                ami=MachineImage.generic_linux({props.aws_region:fleet["worker_machine_image"]})
            else:
                ami=MachineImage.generic_windows({props.aws_region:fleet["worker_machine_image"]})
            # Format workstation list
            instance_type_format_list= []
            for l in fleet["instance_types"]:
                instance_type_format= InstanceType(l)
                instance_type_format_list.append(instance_type_format)
            if "user_data_script" in fleet:
                user_data_script=fleet["user_data_script"]
            else:
                user_data_script=None
            spot_fleet_config = SpotEventPluginFleet(
                        self,
                        f'{fleet["name"]}_spot_event_plugin_fleet',
                        vpc=vpc,
                        render_queue=render_queue,
                        deadline_groups=[f'{fleet["name"]}_group'],
                        security_groups=[worker_fleet_sg],
                        instance_types=instance_type_format_list,
                        worker_machine_image=ami,
                        max_capacity=fleet["max_capacity"],
                        fleet_instance_role=fleet_instance_role,
                        # use the following parameter this if you need to connect to workers
                        # key_name=key_pair_name,
                        allocation_strategy=fleet["allocation_strategy"],
                        user_data_provider=UserDataProvider(
                            self, f'{fleet["name"]}_user_data_provider', props=props, os_key=fleet["is_linux"], user_data_script=user_data_script),
            )
                            
            # Optional: Add additional tags to both spot fleet request and spot instances.
            Tags.of(spot_fleet_config).add('fleet', f'Deadline-{fleet["name"]}')
            spot_fleet.append(spot_fleet_config)
        
        ConfigureSpotEventPlugin(
            self,
            'ConfigureSpotEventPlugin',
            vpc=vpc,
            render_queue=render_queue,
            spot_fleets=spot_fleet,
            configuration=SpotEventPluginSettings(
                enable_resource_tracker=True,
            ),
        )
        # A secret (in binary form) in SecretsManager that stores the UBL certificates in a .zip file.
        # This must be in the format `arn:<partition>:secretsmanager:<region>:<accountId>:secret:<secretName>-<6RandomCharacters`
        if props.ubl_support == True :
            ubl_certificate_secret_arn: str = props.ubl_certificate_secret_arn
            deadline_version: str = props.deadline_version
            
            # The UBL licenses to use.
            ubl_licenses: List[UsageBasedLicense] = props.ubl_licenses  
                
                    # Set Up UBL Licenses
            self.setupLicenses(
                vpc,
                render_queue,
                spot_fleet,
                ubl_licenses=ubl_licenses,
                ubl_certs_secret_arn=ubl_certificate_secret_arn,
                images=ThinkboxDockerImages(
                    self,
                    'Images',
                    version=VersionQuery(
                        self,
                        'Version',
                        version=deadline_version
                    ),
                    user_aws_customer_agreement_and_ip_license_acceptance=AwsCustomerAgreementAndIpLicenseAcceptance.USER_ACCEPTS_AWS_CUSTOMER_AGREEMENT_AND_IP_LICENSE
                )
            )
        
    def setupLicenses(self, vpc, render_queue, spot_fleet, ubl_licenses, ubl_certs_secret_arn, images):
        if ubl_licenses:
            if not ubl_certs_secret_arn:
                raise ValueError('UBL certificates secret ARN is required when using UBL but was not specified.')
            ubl_cert_secret = Secret.from_secret_complete_arn(self, 'ublcertssecret', ubl_certs_secret_arn)
            ubl_licensing = UsageBasedLicensing(
                self,
                'UsageBasedLicensing',
                vpc=vpc,
                images=images.for_usage_based_licensing(),
                licenses=ubl_licenses,
                render_queue=render_queue,
                certificate_secret=ubl_cert_secret,
            )

            # Another optional usage of the SessionManagerHelper that demonstrates how to configure the UBL
            # construct's ASG for access. Note that this construct also requires you to apply the permissions
            # to its ASG property.
            SessionManagerHelper.grant_permissions_to(ubl_licensing.asg)
            
            for fleet in spot_fleet:
                ubl_licensing.grant_port_access(fleet, ubl_licenses)
        else:
            ubl_licensing = None

        return ubl_licensing
