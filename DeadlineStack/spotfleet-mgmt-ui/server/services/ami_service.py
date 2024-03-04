from abc import ABC, abstractmethod
from boto3 import Session


class BaseFilter(ABC):

    @abstractmethod
    def apply_filter(self):
        pass

class WindowsFilter(BaseFilter):
    def apply_filter(self):
        return [{'Name': 'platform-details', 'Values': ['Windows']}]

class LinuxFilter(BaseFilter):
    def apply_filter(self):
        return [{'Name': 'platform-details', 'Values': ['Linux/UNIX']}]


class AMIService:
    def __init__(self, profile_name: str, region_name: str):
        self.session = Session(profile_name=profile_name)
        self.ec2 = self.session.client('ec2', region_name=region_name)
        self.filters = []
        
    def add_filter(self, filter_obj: BaseFilter):
        self.filters.append(filter_obj)

    def list_amis(self):
        ami_filters = []
        for filter_obj in self.filters:
            ami_filters.extend(filter_obj.apply_filter())

        amis = self.ec2.describe_images(Owners=['self'], Filters=ami_filters)
        return amis