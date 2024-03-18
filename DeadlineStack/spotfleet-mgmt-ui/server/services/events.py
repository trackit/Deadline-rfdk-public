from database.dynamo_db import DynamoDB
import boto3
import uuid


class EventsException(Exception):
    pass


class Events:
    def __init__(self):
        self._table_name = 'events'
        self.dynamodb = DynamoDB(self._table_name)
        self.local_dynamodb = boto3.resource(
            'dynamodb', endpoint_url="http://localhost:8000")
        if not self._table_name in self.local_dynamodb.meta.client.list_tables()['TableNames']:
            self.create_event_table()

    def create_event_table(self):
        self.local_dynamodb.create_table(
            TableName=self._table_name,
            KeySchema=[
                {
                    'AttributeName': 'Hashkey',
                    'KeyType': 'HASH'
                }],
            AttributeDefinitions=[
                {
                    'AttributeName': 'Hashkey',
                    'AttributeType': 'S'
                }],
            BillingMode='PAY_PER_REQUEST'
        )

    def new_event(self, event_type: str, original_path: str, backup_path: str, json_data: dict):
        try:
            self.dynamodb.put_item_db({
                'Hashkey': str(uuid.uuid4()),
                'event_type': event_type,
                'original_path': original_path,
                'backup_path': backup_path,
                'json_data': json_data
            }, db_client=self.local_dynamodb)

        except Exception as e:
            raise EventsException(
                f"Error processing event: {str(e)}")
