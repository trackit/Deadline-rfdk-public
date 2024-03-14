
const fleetData = {
    "Fleet01": {
        AllocationStrategy: "capacityOptimized",
        IamFleetRole: "arn:aws:iam::[AWS-ACCOUNT]:role/aws-ec2-spot-fleet-tagging-role",
        LaunchSpecifications: [],
        LaunchTemplateConfigs: [
            {
                LaunchTemplateSpecification: {
                    Version: "$Latest",
                    LaunchTemplateId: "[LAUNCH-TEMPLATE1]",
                },
                Overrides: [
                    {
                        SubnetId: "[SUBNET1]",
                        InstanceType: "[INSTANCE-TYPE]",
                    },
                ],
            },
        ],
        ReplaceUnhealthyInstances: true,
        TargetCapacity: "[TARGET-CAPACITY-VALUE]",
        TerminateInstancesWithExpiration: true,
        Type: "maintain",
        TagSpecifications: [
            {
                ResourceType: "spot-fleet-request",
                Tags: [
                    {
                        Value: "[PROJECT-VALUE]",
                        Key: "project",
                    },
                ],
            },
        ],
    },
};

export default fleetData;
