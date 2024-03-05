import boto3


class InstanceTypeService:
    def __init__(self, profile_name: str):
        self.session = boto3.Session(profile_name=profile_name)
        
    def list_instance_types(self, region_name: str):
        ec2 = self.session.client('ec2', region_name=region_name)

        instance_types = []
        describe_args = {}
        while True:
            response = ec2.describe_instance_types(**describe_args)
            for instance_type_info in response['InstanceTypes']:
                instance_types.append(instance_type_info['InstanceType'])

            if 'NextToken' in response:
                describe_args['NextToken'] = response['NextToken']
            else:
                break
            
        return instance_types
