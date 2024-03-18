
const fleetData = {
    "Fleet 1": {
        AllocationStrategy: "capacityOptimized",
        IamFleetRole: "arn:aws:iam::[AWS-ACCOUNT]:role/aws-ec2-spot-fleet-tagging-role",
        LaunchSpecifications: [
            {
                ImageId: "ami-02f7d8d586e698497",
                InstanceType: "c5.9xlarge",
                BlockDeviceMappings: [
                    {
                        DeviceName: "/dev/xvda",
                        Ebs: {
                            DeleteOnTermination: true,
                            Encrypted: false,
                            SnapshotId: "snap-0e2f8cfd851bb888e",
                            VolumeSize: 20,
                            VolumeType: "gp2"
                        }
                    }
                ],
                KeyName: "deadlinetest",
                IamInstanceProfile: {
                    Arn: "arn:aws:iam::576872909007:instance-profile/DeadlineStack-BlenderspoteventpluginfleetInstanceProfile306E6A34-wgxYaaW9uQFU"
                },
                SubnetId: "subnet-0c0d96cc0ca51d9ca, subnet-00d3a467fbbc0c549, subnet-0cff6ec4642a1a9b1"
            }
        ],
        LaunchTemplateConfigs: [],
    },
    "Fleet 2":{
        AllocationStrategy:"capacityOptimized",
        IamFleetRole:"arn:aws:iam::[AWS-ACCOUNT]:role/aws-ec2-spot-fleet-tagging-role",
        LaunchSpecifications:[],
        LaunchTemplateConfigs:[
            {
                LaunchTemplateSpecification:{
                    Version:"$Latest",
                    LaunchTemplateId:"[LAUNCH-TEMPLATE2]"
                },
                Overrides:[
                    {
                        SubnetId:"[SUBNET1]",
                        InstanceType:"[INSTANCE-TYPE]"
                    }
                ]
            },

      ],
      ReplaceUnhealthyInstances:true,
      TargetCapacity:2,
      TerminateInstancesWithExpiration:true,
      Type:"maintain",
      TagSpecifications:[
        {
            ResourceType:"spot-fleet-request",
            Tags:[
                {
                    Value:"[PROJECT-VALUE]",
                    Key:"project"
                }

           ]

        }

     ]

   }
};

export default fleetData;
