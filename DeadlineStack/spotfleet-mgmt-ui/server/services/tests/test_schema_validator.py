import pytest
from unittest.mock import mock_open, patch
from ..schema_validator import SchemaValidator, SchemaValidationException


class TestSchemaValidator:

    def test_load_json_existing_file(self):
        path = 'path/to/existing/file.json'
        file_content = '{"key": "value"}'

        with patch('builtins.open', mock_open(read_data=file_content)):
            result = SchemaValidator().load_json(path)

        assert result == {"key": "value"}

    def test_load_json_nonexistent_file(self):
        with pytest.raises(SchemaValidationException, match="File not found:"):
            SchemaValidator().load_json("nonexistent_file.json")

    def test_load_json_invalid_json(self):
        path = 'path/to/invalid/json.json'
        invalid_json = 'invalid_json'

        with pytest.raises(SchemaValidationException, match="JSON file is invalid:"):
            with patch('builtins.open', mock_open(read_data=invalid_json)):
                SchemaValidator().load_json(path)

    def test_validate_valid_data(self):
        data_content = SchemaValidator().load_json(
            'server/schemas/config_exemple.json')
        result = SchemaValidator().validate(
            'server/schemas/config_exemple.json', 'server/schemas/fleet_config.json')

        assert result == data_content

    def test_validate_invalid_data(self):
        with pytest.raises(SchemaValidationException, match="Validation error:"):
            SchemaValidator().validate('server/schemas/invalid_config_exemple.json',
                                       'server/schemas/fleet_config.json')
