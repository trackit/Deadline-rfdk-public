
const fleetData = {
    "Fleet 2":{
        AllocationStrategy:"capacityOptimized",
        IamFleetRole:"arn:aws:iam::[AWS-ACCOUNT]:role/aws-ec2-spot-fleet-tagging-role",
        LaunchSpecifications:[],
        LaunchTemplateConfigs:[
            {
                "LaunchTemplateSpecification": {
                   "LaunchTemplateId": "lt-0763bb2b7c53ddf05",
                   "Version": "$Latest"
                },
                "Overrides": [
                   {
                      "InstanceType": "c5.xlarge",
                      "Priority": 2,
                      "SubnetId": "subnet-1"
                   }
                ]
             },
             {
                "LaunchTemplateSpecification": {
                   "LaunchTemplateId": "lt-0763bb2b7c53ddf05",
                   "Version": "$Latest"
                },
                "Overrides": [
                   {
                      "InstanceType": "c5.xlarge",
                      "Priority": 2,
                      "SubnetId": "subnet-2"
                   }
                ]
             },
            {
                "LaunchTemplateSpecification": {
                   "LaunchTemplateId": "lt-0763bb2b7c53ddf05",
                   "Version": "$Latest"
                },
                "Overrides": [
                   {
                      "InstanceType": "t3.small",
                      "Priority": 2,
                      "SubnetId": "subnet-1"
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
