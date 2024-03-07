import boto3
from botocore.exceptions import ClientError


class DynamoDB:
    def __init__(self, table_name):
        self.table_name = table_name
        self.dynamodb = boto3.resource('dynamodb')
        self.table = self.dynamodb.Table(table_name)

    def put_item_db(self, item, db_client=None):
        if db_client is not None:
            self.table= db_client.Table(self.table_name)
        else:
            self.table = self.dynamodb.Table(self.table_name)
        try:
            self.table.put_item(Item=item)
        except ClientError as e:
            raise e

    def get_item_db(self, db_client=None, **kwargs):
        if db_client is not None:
            self.table = db_client.Table(self.table_name)
        else:
            self.table = self.dynamodb.Table(self.table_name)

        try:
            valid_args = ['Key', 'AttributesToGet', 'ProjectionExpression']
            response = self.table.get_item(**{k: v for k, v in kwargs.items() if k in valid_args})
            item = response['Item']
        except ClientError as e:
            raise e
        else :
            return item

        
    def query_item_db(self, db_client=None, **kwargs):
        if db_client is not None:
            self.table = db_client.Table(self.table_name)
        else:
            self.table = self.dynamodb.Table(self.table_name)
        try:
            response = self.table.query(**kwargs)
            result = response['Items']

            while 'LastEvaluatedKey' in response:
                response = self.table.query(ExclusiveStartKey=response['LastEvaluatedKey'], **kwargs)
            
                result.extend(response['Items'])
            return result
        except ClientError as e:
            raise e   
    

    def delete_item_db(self, key, db_client=None):
        if db_client is not None:
            self.table = db_client.Table(self.table_name)
        else:
            self.table = self.dynamodb.Table(self.table_name)
        try:
            self.table.delete_item(Key=key)
        except ClientError as e:
            raise e
        
    def update_item_db(self, db_client=None, **kwargs):
        if db_client is not None:
            self.table = db_client.Table(self.table_name)
        else:
            self.table = self.dynamodb.Table(self.table_name)
        try:
            self.table.update_item(**kwargs)
        except ClientError as e:
            raise e


    
