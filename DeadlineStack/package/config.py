# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

from aws_cdk.aws_ec2 import (
    InstanceClass,
    InstanceSize,
    InstanceType,
)
from aws_rfdk.deadline import (
    SpotFleetAllocationStrategy,
)
from typing import (
    Mapping,
)

class AppConfig:
    """
    Configuration values for the sample app.

    TODO: Fill these in with your own values.
    """
    def __init__(self):
        # A map of regions to Deadline Client Linux AMIs. As an example, the base Linux Deadline 10.1.19.4 AMI ID
        # from us-west-2 is filled in. It can be used as-is, added to, or replaced. Ideally the version here
        #  should match the one used for staging the render queue and usage based licensing recipes.
        self.deadline_client_linux_ami_map: Mapping[str, str] = {'us-west-2': 'ami-067d780e98fe3b09f'}

        # Whether the DeadlineResourceTrackerAccessRole IAM role required by Deadline's Resource Tracker should be created in this CDK app.
        #
        # If you have previously used this same AWS account with either Deadline's AWS Portal feature or Spot Event Plugin and had used the
        # Deadline Resource Tracker, then you likely have this IAM role in your account already unless you have removed it.
        #
        # Note: Deadline's Resource Tracker only supports being used by a single Deadline Repository per AWS account.
        self.create_resource_tracker_role: bool = True
        # AWS region deadline is deployed into (ex: "us-west-2")
        self.aws_region:str = ""
        # Active directory secret arn ex: arn:aws:secretsmanager:us-west-2:xxxxxx:secret:StudioADAdminAccountCredentials-xxxxx
        self.secret_domain_arn:str = ""
        # Deadline VPC CIDR required (ex:"172.0.0.0/16")
        self.vpc_cidr: str = ""
        # If using to integrate in SIC (studio in the cloud), the studio vpc id (required for vpc peering)
        self.sic_vpc_id: str = ""
        # If using to integrate in SIC (studio in the cloud), the studio vpc cidr (generally "10.0.0.0/16") (required for vpc peering)
        self.sic_vpc_cidr: str = ""
        # If using to integrate in SIC (studio in the cloud), the subnet workstation cidr (to allow workstations to connect to rcs server)
        self.sic_workstation_subnet_cidr: str = ""
        # Bucket for workers script
        self.s3_bucket_workers: str = ""
        # Active directory domain name
        self.ad_domain_name: str = ""
        # Active directory ip address 1
        self.ad_domain_ip_1: str = ""
        # Active directory ip address 2
        self.ad_domain_ip_2: str = ""

        # Spot instance fleet configuration
        # For each fleet, use those parameters:
        # "name" str is name of the fleet, which will be used as prefix for naming ressources as well (ex: "Blender")
        # "is_linux" int is the OS type used by worker AMI. use 1 if linux, 0 if Windows, will setup AMI method & setup required user data
        # "instance_types"
        # "worker_machine_image" str is the ami name of the worker AMI used (ex: "ami-067d780e98fe3b09f")
        # "max_capacity" int is the number of workers required by the fleet (ex: 1)
        # "allocation_strategy"  is the allocation strategy used by the fleet (ex: SpotFleetAllocationStrategy.CAPACITY_OPTIMIZED) https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-fleet-allocation-strategy.html
        # "user_data_script" expecting filename string (sh for Linux, ps1 for Windows) is an additional script file you uploaded to the worker S3 bucket, use None if not used.
        self.fleet_config: dict = {
            "fleet1": {
                "name":"Blender",
                "is_linux":1,
                # "instance_types":[InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.LARGE)],
                "instance_types":["m5.large","m5.2xlarge"],
                "worker_machine_image":"",
                "max_capacity":1,
                "allocation_strategy":SpotFleetAllocationStrategy.CAPACITY_OPTIMIZED,
                "user_data_script":None
            },
            "fleet2": {
                "name":"Maya",
                "is_linux":1,
                "instance_types":["m5.large","m5.2xlarge"],
                "worker_machine_image":"",
                "max_capacity":1,
                "allocation_strategy":SpotFleetAllocationStrategy.CAPACITY_OPTIMIZED,
                "user_data_script":None
            }
        }

        # UBL configuration
        # UBL support deployment trigger, boolean, switch it to True if needed and fill the rest of the variables
        self.ubl_support= False
        # UBL certificate secret arn, string
        # Rfdk is expecting here an AWS secret binary arn, which you can only create through AWS CLI. You can see it related doc at https://docs.thinkboxsoftware.com/products/deadline/10.1/1_User%20Manual/manual/licensing-usage-based.html, Get the certificate zip file and use the following command to create the secret:
        # aws secretsmanager create-secret --secret-id NameOfTheSecret --secret-binary fileb://pathToCertificateZipFile
        # where NameOfTheSecret is the desired name of the secret you creating (example: ubl-certificate-secret)
        # and pathToCertificateZipFile is the path of the secret dependingon your OS, keep fileb:// at the beginning of this path
        # Then you can get the resulting arn from SecretManager or CLI with this command: aws secretsmanager get-secret-value --secret-id NameOfTheSecret)
        self.ubl_certificate_secret_arn=""
        # UBL deadline version,string this is used to select the Thinkbox provided AMI for licence forwarder AMI, use the same version as the one you're deploying
        # example : "10.2.0.10"
        self.deadline_version=""
        # UBL licenses, expecting List[UsageBasedLicense]
        # for example :
        # [
        #     UsageBasedLicense.for_arnold(),
        #     UsageBasedLicense.for_houdini()
        # ]
        # For available static methods (licenses supported), follow this link: https://docs.aws.amazon.com/rfdk/api/latest/python/aws_rfdk.deadline/UsageBasedLicense.html
        # you can set a limit for each of them, like so for example : UsageBasedLicense.for_arnold(10)
        self.ubl_licenses= []

config: AppConfig = AppConfig()
