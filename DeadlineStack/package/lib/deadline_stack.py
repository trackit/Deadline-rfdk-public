# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

from os import path
from aws_cdk import aws_ecs as ecs
from aws_cdk.aws_ecr import Repository as EcrRepository
from aws_cdk.aws_ecr_assets import DockerImageAsset
# from aws_cdk.aws_ecr_deployment import (
#     DockerImageName,
#     Source,
#     TagParameter,
# )

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
    Instance,
    InstanceClass,
    InstanceSize,
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
    ThinkboxDockerRecipes,
)
from aws_rfdk import (
    DistinguishedName,
    X509CertificatePem,
)
from constructs import (
    Construct
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
    # Deadline vpc to create CIDR
    vpc_cidr: str
    # S3 bucket for workers
    s3_bucket_workers: str
    # S3 bucket worker region (verifiy this on S3 service)
    s3_bucket_workers_region: str
    # Spot instance fleet configuration
    fleet_config: dict
    # Custom AMI for Test EC2
    custom_ami_id: str
    # Keypair for the test EC2 instance
    ec2_key_pair_name: str


# USER DATA Handling
class UserDataProvider(InstanceUserDataProvider):
    def __init__(self, scope: Construct, stack_id: str, *, props: DeadlineStackProps, os_key: int, user_data_script=None, **kwargs):
        super().__init__(scope, stack_id, **kwargs)
        self.props = props
        self.os_key = os_key
        self.user_data_script = user_data_script

    def pre_render_queue_configuration(self, host) -> None:
        host.user_data.add_commands(
            "echo 'Entering preRenderQueueConfiguration'")

        try:
            license_bucket = Bucket.from_bucket_attributes(
                self,
                'license_bucket',
                bucket_name=self.props.s3_bucket_workers,
            )
            host.user_data.add_commands("echo 'Initialized license_bucket'")

            if self.user_data_script is not None:
                user_data_path = host.user_data.add_s3_download_command(
                    bucket=license_bucket,
                    bucket_key=f'deadline/{self.user_data_script}',
                    region=self.props.s3_bucket_workers_region
                )
                host.user_data.add_commands(
                    f"echo 'Downloaded user data script to {user_data_path}'")
                host.user_data.add_execute_file_command(
                    file_path=user_data_path)
                host.user_data.add_commands("echo 'Executed user data script'")
            else:
                host.user_data.add_commands(
                    "echo 'No user_data_script provided'")

        except Exception as e:
            host.user_data.add_commands(f"echo 'Error: {str(e)}'")

        host.user_data.add_commands(
            "echo 'Exiting preRenderQueueConfiguration'")

    def pre_worker_configuration(self, host) -> None:
        if self.os_key == 1:
            host.user_data.add_commands(
                "/opt/Thinkbox/Deadline10/bin/deadlinecommand -SetIniFileSetting ProxyRoot0 'renderqueue.deadline.internal:4433'")
            host.user_data.add_commands(
                "/opt/Thinkbox/Deadline10/bin/deadlinecommand -SetIniFileSetting ProxyRoot 'renderqueue.deadline.internal:4433'")
        else:
            host.user_data.add_commands(
                r"$DEADLINE_PATH = 'C:\Program Files\Thinkbox\Deadline10\bin'")
            host.user_data.add_commands("pushd $DEADLINE_PATH")
            host.user_data.add_commands(
                ".\deadlinecommand.exe -SetIniFileSetting ProxyRoot0 'renderqueue.deadline.internal:4433'")
            host.user_data.add_commands(
                ".\deadlinecommand.exe -SetIniFileSetting ProxyRoot 'renderqueue.deadline.internal:4433'")
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
        cloud9IamGroup = Group(self, "Cloud9Admin")
        cloud9IamGroup.add_managed_policy(
            ManagedPolicy.from_aws_managed_policy_name('AWSCloud9Administrator'))

        # The VPC that all components of the render farm will be created in.
        vpc = Vpc(
            self,
            'Vpc',
            max_azs=99,
            nat_gateways=1,
            cidr=props.vpc_cidr,
            subnet_configuration=[SubnetConfiguration(subnet_type=SubnetType.PUBLIC,
                                                      cidr_mask=28,
                                                      name="public"),
                                  SubnetConfiguration(subnet_type=SubnetType.PRIVATE_WITH_EGRESS,
                                                      cidr_mask=19,
                                                      name="render-")
                                  ]
        )
        

        # Create an ECR repository
        ecr_repository = EcrRepository(
            self,
            'Spotfleet-Mgmt-UI-ECR-Repository',
            image_scan_on_push=True,  # Enable image scanning on push
            removal_policy=RemovalPolicy.DESTROY  # Adjust the removal policy as needed
        )

        # Create an asset from the spotfleet-mgmt-ui directory
        asset = DockerImageAsset(
            self,
            "sfmt",
            directory="./spotfleet-mgmt-ui",
        )

        # Deploy the asset to the ECR repository

        # ecr_repository.grant_pull_push(asset.grant_principal)
        # asset.repository = ecr_repository

        # ecr_repository.on_image_scan_completed(
        #     "ImageScanComplete").add_target(asset)

        # docker_image_asset_hash = asset.asset_hash
        # destination_image_name = f"{ecr_repository.repository_uri}:{docker_image_asset_hash}"

        # ecr_deploy = ecr_deployment.ECRDeployment(
        #     self,
        #     "EcrDeployment",
        #     src=ecr_deployment.DockerImageName(
        #         self.docker_image_asset.image_uri),
        #     dest=ecr_deployment.DockerImageName(destination_image_name),
        # )

        # Create an ECS cluster
        ecs_cluster = ecs.Cluster(
            self,
            'Spotfleet-Mgmt-UI-ECS-Cluster',
            vpc=vpc
        )

        # Create an ECS task definition
        # This task must run the image present in the ECR repo


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

        # create worker IAM role

        fleet_instance_role = Role(
            self,
            'FleetRole',
            role_name='Deadline-Fleet-Instance-Role',
            assumed_by=ServicePrincipal('ec2.amazonaws.com'),
            managed_policies=[ManagedPolicy.from_aws_managed_policy_name(
                'AWSThinkboxDeadlineSpotEventPluginWorkerPolicy')],
            inline_policies={
                "s3_licence_access": PolicyDocument(
                    statements=[
                        PolicyStatement(
                            actions=["s3:GetObject"],
                            resources=["arn:aws:s3:::" +
                                       props.s3_bucket_workers+"/*"]
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
        render_queue.connections.allow_default_port_from(
            Peer.ipv4(props.vpc_cidr))

        if props.create_resource_tracker_role:
            # Creates the Resource Tracker Access role. This role is required to exist in your account so the resource tracker will work properly
            Role(
                self,
                'ResourceTrackerRole',
                assumed_by=ServicePrincipal('lambda.amazonaws.com'),
                managed_policies=[ManagedPolicy.from_aws_managed_policy_name(
                    'AWSThinkboxDeadlineResourceTrackerAccessPolicy')],
                role_name='DeadlineResourceTrackerAccessRole',
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

        # iterate through props.fleet_config dict
        spot_fleet = []
        for i, fleet in props.fleet_config.items():
            # determine worker AMI OS
            if fleet["is_linux"] == 1:
                ami = MachineImage.generic_linux(
                    {props.aws_region: fleet["worker_machine_image"]})
            else:
                ami = MachineImage.generic_windows(
                    {props.aws_region: fleet["worker_machine_image"]})
            # Format workstation list
            instance_type_format_list = []
            for l in fleet["instance_types"]:
                instance_type_format = InstanceType(l)
                instance_type_format_list.append(instance_type_format)
            if "user_data_script" in fleet:
                user_data_script = fleet["user_data_script"]
            else:
                user_data_script = None
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
            Tags.of(spot_fleet_config).add(
                'fleet', f'Deadline-{fleet["name"]}')
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

        # Security Group for EC2 Instance to communicate with AWS Systems Manager
        ssm_sg = SecurityGroup(
            self,
            "SSMSecurityGroup",
            vpc=vpc,
            description="Security group for EC2 instance to allow communication with AWS Systems Manager",
            allow_all_outbound=True  # Allows all outbound traffic by default
        )

        # Adding ingress rule to allow RDP access from any source
        ssm_sg.add_ingress_rule(
            peer=Peer.any_ipv4(),
            connection=Port.tcp(3389),
            description="Allow RDP access from any source"
        )

        # IAM Role for EC2 Fleet Connect through AWS Systems Manager
        ssm_role = Role(
            self,
            "SSMInstanceRole",
            assumed_by=ServicePrincipal("ec2.amazonaws.com"),
            managed_policies=[
                ManagedPolicy.from_aws_managed_policy_name(
                    "AmazonSSMManagedInstanceCore"),
                ManagedPolicy.from_aws_managed_policy_name(
                    "service-role/AmazonEC2RoleforSSM")
            ]
        )

        # IAM policy to allow EC2 instance to access the S3 bucket
        s3_access_policy = PolicyStatement(
            actions=["s3:GetObject"],
            resources=[f"arn:aws:s3:::{props.s3_bucket_workers}/*"]
        )

        # Attach the policy to the EC2 instance role
        ssm_role.add_to_policy(s3_access_policy)

        # EC2 Instance Deployment
        instance = Instance(
            self,
            "RepositoryAccessInstance",
            instance_type=InstanceType.of(
                InstanceClass.COMPUTE5, InstanceSize.LARGE),  # c5.large
            # Custom Windows AMI with Deadline client
            machine_image=MachineImage.generic_windows(
                {props.aws_region: props.custom_ami_id}),
            vpc=vpc,
            # Deploy in a public subnet
            vpc_subnets={"subnet_type": SubnetType.PUBLIC},
            security_group=ssm_sg,
            role=ssm_role,
            key_name=props.ec2_key_pair_name
        )

        # Adding user data to connect to the repository
        instance.user_data.add_commands(
            "echo 'Configuring instance to access Deadline Repository'",
            # Add commands here to configure the instance to connect to the repository
        )

        # Modify user data to download the certificate from S3
        instance.user_data.add_commands(
            "New-Item -ItemType Directory -Path C:\\deadline -Force",
            "Read-S3Object -BucketName " + props.s3_bucket_workers +
            " -Key 'deadline/ca.crt' -File 'C:\\deadline\\ca.crt' -ErrorAction Stop",
            "Write-Output 'configuring deadline connection'",
            "$DEADLINE_PATH = 'C:\\Program Files\\Thinkbox\\Deadline10\\bin'",
            "pushd $DEADLINE_PATH",
            ".\\deadlinecommand.exe -SetIniFileSetting ConnectionType Remote",
            ".\\deadlinecommand.exe -SetIniFileSetting ProxyUseSSL True",
            ".\\deadlinecommand.exe -SetIniFileSetting LaunchSlaveAtStartup 0",
            ".\\deadlinecommand.exe -SetIniFileSetting ProxySSLCA 'C:\\deadline\\ca.crt'",
            ".\\deadlinecommand.exe -SetIniFileSetting ClientSSLAuthentication NotRequired",
            ".\\deadlinecommand.exe -SetIniFileSetting ProxyRoot renderqueue.deadline.internal:4433"
        )
