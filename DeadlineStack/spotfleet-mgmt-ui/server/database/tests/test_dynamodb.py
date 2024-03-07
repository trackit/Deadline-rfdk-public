import os
from botocore.exceptions import ClientError
import pytest
import boto3
import json
from boto3.dynamodb.conditions import Key
from ..dynamo_db import DynamoDB

class TestDynamoDB:
    _table_name= 'test'
   
    @pytest.fixture()
    def local_dynamodb(self):
        local_dynamodb = boto3.resource('dynamodb', endpoint_url="http://localhost:8000")
        local_dynamodb.create_table(
            TableName=self._table_name,
            KeySchema=[
            {
                'AttributeName': 'Test_Hashkey',
                'KeyType': 'HASH' 
            },
            {
                'AttributeName': 'Test_RangeKey',
                'KeyType': 'RANGE'  
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'Test_Hashkey',
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'Test_RangeKey',
                'AttributeType': 'N'
            },

        ],
        BillingMode='PAY_PER_REQUEST'
        )
        yield local_dynamodb 
        local_dynamodb.Table(self._table_name).delete()
        
    
    @pytest.fixture
    def dynamodb_instance(self):
        return DynamoDB(self._table_name)
    
    @pytest.fixture
    def test_data(self):
        test_data_path = os.path.join(os.path.dirname(__file__), 'test_file_config.json')
        with open(test_data_path) as f:
            return json.load(f)

    def test_put_item_db_success(self, dynamodb_instance, local_dynamodb, test_data):
        for data in test_data:
            dynamodb_instance.put_item_db(data, db_client=local_dynamodb)
            key = {
                'Test_Hashkey': data['Test_Hashkey'],
                'Test_RangeKey': data['Test_RangeKey']
            }
            response = local_dynamodb.Table(self._table_name).get_item(Key=key) 
            retrieved_item = response['Item'] 
            assert retrieved_item == data
    
    def test_put_item_db_failure(self, dynamodb_instance, local_dynamodb):
        invalid_item = {'InvalidAttributeName': 'value'} 
        with pytest.raises(Exception): 
            dynamodb_instance.put_item_db(invalid_item, db_client=local_dynamodb)

    def test_get_item_db_success(self, dynamodb_instance, local_dynamodb, test_data):
        item = test_data[0]
        local_dynamodb.Table(self._table_name).put_item(Item=item)
        key = {
            'Test_Hashkey': test_data[0]['Test_Hashkey'],
            'Test_RangeKey': test_data[0]['Test_RangeKey']
            }

        retrieved_item = dynamodb_instance.get_item_db(Key=key, db_client =local_dynamodb)
        assert retrieved_item == item

    
    def test_get_item_db_failure(self, dynamodb_instance, local_dynamodb):
        with pytest.raises(ClientError) :
            dynamodb_instance.get_item_db(Key={'non_existing_key': 'value'}, db_client =local_dynamodb) 
    

    def test_query_item_db_success(self, dynamodb_instance, local_dynamodb, test_data):
        for data in test_data:
            local_dynamodb.Table(self._table_name).put_item(Item=data)
        
        query_result = dynamodb_instance.query_item_db(KeyConditionExpression=Key('Test_Hashkey').eq(test_data[0]['Test_Hashkey']), db_client=local_dynamodb)
        assert len(query_result) > 0
    
    def test_query_item_db_failure(self, dynamodb_instance, local_dynamodb):
        with pytest.raises(Exception):
            dynamodb_instance.query_item_db(KeyConditionExpression=Key('NonExistingAttribute').eq('value'), db_client=local_dynamodb)

    def test_delete_item_success(self, dynamodb_instance, local_dynamodb, test_data):
        item = test_data[0]
        local_dynamodb.Table(self._table_name).put_item(Item=item)
        key = {
            'Test_Hashkey': test_data[0]['Test_Hashkey'],
            'Test_RangeKey': test_data[0]['Test_RangeKey']
            }
        dynamodb_instance.delete_item_db(key=key, db_client=local_dynamodb)
        response = local_dynamodb.Table(self._table_name).get_item(Key=key)
        assert 'Item' not in response

    def test_delete_item_failure(self, dynamodb_instance, local_dynamodb):
        key = {'Test_Hashkey': 'non_existing_key', 'Test_RangeKey': 'non_existing_range_key'}
        with pytest.raises(Exception):  
            dynamodb_instance.delete_item_db(key=key, db_client=local_dynamodb)

    def test_update_item_db(self, dynamodb_instance, local_dynamodb, test_data):
        item = test_data[0]
        local_dynamodb.Table(self._table_name).put_item(Item=item)
        update_expression = "SET AttributeToUpdate = :new_value"
        expression_attribute_values = {":new_value": "updated_value"}
        key = {
            'Test_Hashkey': test_data[0]['Test_Hashkey'],
            'Test_RangeKey': test_data[0]['Test_RangeKey']
            }
        dynamodb_instance.update_item_db(Key=key, UpdateExpression=update_expression, ExpressionAttributeValues=expression_attribute_values, db_client=local_dynamodb)
        response = local_dynamodb.Table(self._table_name).get_item(Key=key)
        assert 'Item' in response

        updated_item = response['Item']
        assert updated_item['AttributeToUpdate'] == 'updated_value'
    
    def test_update_item_db_failure(self, dynamodb_instance, local_dynamodb):
        key = {'Test_Hashkey': 'non_existing_key', 'Test_RangeKey': 'non_existing_range_key'}
        update_expression = "SET AttributeToUpdate = :new_value"
        expression_attribute_values = {":new_value": "updated_value"}
        with pytest.raises(Exception):  
            dynamodb_instance.update_item_db(Key=key, UpdateExpression=update_expression, ExpressionAttributeValues=expression_attribute_values, db_client=local_dynamodb)