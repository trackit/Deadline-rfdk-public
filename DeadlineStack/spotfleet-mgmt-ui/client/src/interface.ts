
interface Ebs {
    DeleteOnTermination: boolean;
    Encrypted: boolean;
    SnapshotId: string;
    VolumeSize: number;
    VolumeType: string;

}
interface BlockDeviceMapping {
    DeviceName: string;
    Ebs: Ebs
}

interface IamInstanceProfile {
    Arn: string;
}

interface LaunchSpecification {
    ImageId: string;
    InstanceType: string;
    BlockDeviceMappings: BlockDeviceMapping[];
    KeyName: string;
    IamInstanceProfile: IamInstanceProfile;
    SubnetId: string;
}

export interface LaunchTemplateSpecification {
    LaunchTemplateId: string;
    Version: string;
}

export interface Override {
    InstanceType: string;
    SubnetId: string | string[];
    Priority: number;
}

export interface LaunchTemplateConfig {
    LaunchTemplateSpecification: LaunchTemplateSpecification;
    Overrides: Override[];
}

interface Tag {
    Value: string;
    Key: string;
}

interface TagSpecification {
    ResourceType: string;
    Tags: Tag[];
}

export interface Fleet {
    [key: string]: {
        AllocationStrategy: string;
        IamFleetRole: string;
        LaunchSpecifications: LaunchSpecification[];
        LaunchTemplateConfigs: LaunchTemplateConfig[];
        ReplaceUnhealthyInstances: boolean;
        TargetCapacity: number;
        TerminateInstancesWithExpiration: boolean;
        Type: string;
        TagSpecifications: TagSpecification[];
        ValidFrom?: string;
        ValidUntil?: string;
        InstanceInterruptionBehavior: string;
    };
}

export interface FleetFormProps {
    formData: Fleet;
    onDataUpdate: (updatedData: Record<string, any>) => void;
}