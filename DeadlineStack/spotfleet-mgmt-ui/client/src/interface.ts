
export interface FleetData {
    [fleetName: string]: {
        AllocationStrategy: string;
                IamFleetRole: string;
                LaunchSpecifications: Array<{
                    ImageId: string;
                    InstanceType: string
                    BlockDeviceMappings: Array<{
                        Devicename: string;
                        Ebs: Array<{
                            DeleteOnTermination: boolean;
                        Encrypted: boolean;
                        SnapshotId: string;
                        VolumeSize: 20;
                        VolumeType: string;
                        }>;
                    }>;
                    KeyName: string;
                    IamInstanceProfile: Array<{
                        Arn: string;
                    }>;
                    SubnetId: string;
                }>;
                LaunchTemplateConfigs: Array<{
                    LaunchTemplateSpecification: {
                        Version: string;
                        LaunchTemplateId: string;
                    };
                    Overrides: Array<{
                        SubnetId: string;
                        InstanceType: string;
                    }>;
                }>;
                ReplaceUnhealthyInstances: boolean;
                TargetCapacity: number | string; 
                TerminateInstancesWithExpiration: boolean;
                Type: string;
                TagSpecifications: Array<{
                    ResourceType: string;
                    Tags: Array<{
                        Value: string;
                        Key: string;
                    }>;
                }>;
                ValidFrom: string;
                ValidUntil: string;
                InstanceInterruptionBehavior: string;
            };
}


export interface FleetFormProps {
    fleetData: FleetData;
    fleetTitle: string;
}


export interface InputFieldProps {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
