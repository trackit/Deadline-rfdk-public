
const fleetData = {
   "fleet_1": {
       "AllocationStrategy": "capacityOptimized",
       "IamFleetRole": "arn:aws:iam::576872909007:role/aws-ec2-spot-fleet-tagging-role",
       "LaunchSpecifications": [],
       "LaunchTemplateConfigs": [
           {
               "LaunchTemplateSpecification": {
                 "LaunchTemplateId": "lt-0b2262ba6c677f0a0",
                 "Version": "$Latest"
               },
               "Overrides": [
                 {
                   "InstanceType": "c5.large",
                   "SubnetId": "subnet-00d3a467fbbc0c549"
                 }
               ]
             },
             {
               "LaunchTemplateSpecification": {
                 "LaunchTemplateId": "lt-0b2262ba6c677f0a0",
                 "Version": "$Latest"
               },
               "Overrides": [
                 {
                   "InstanceType": "c5.large",
                   "SubnetId": "subnet-0c0d96cc0ca51d9ca"
                 }
               ]
             },
             {
               "LaunchTemplateSpecification": {
                 "LaunchTemplateId": "lt-0b2262ba6c677f0a0",
                 "Version": "$Latest"
               },
               "Overrides": [
                 {
                   "InstanceType": "c5.large",
                   "SubnetId": "subnet-0cff6ec4642a1a9b1"
                 }
               ]
             }
       ],
       "ReplaceUnhealthyInstances": true,
       "TargetCapacity": 1,
       "TerminateInstancesWithExpiration": true,
       "Type": "maintain",
       "TagSpecifications": [
           {
               "ResourceType": "spot-fleet-request",
               "Tags": [
                   {
                       "Value": "0.42.0:SpotEventPluginFleet",
                       "Key": "aws-rfdk"
                   },
                   {
                       "Value": "1.1.9",
                       "Key": "deployedByStudioBuilderVersion"
                   }
               ]
           }
       ]
   }
};

export default fleetData;
