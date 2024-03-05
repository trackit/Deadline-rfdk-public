import json
import jsonschema


class SchemaValidationException(Exception):
    pass


class SchemaValidator:

    def load_json(self, path: str):
        try:
            with open(path) as schema_file:
                return json.load(schema_file)
        except FileNotFoundError:
            raise SchemaValidationException(
                f"File not found: {path}")
        except json.JSONDecodeError:
            raise SchemaValidationException(
                f"JSON file is invalid: {path}")
        except Exception as e:
            raise SchemaValidationException(
                f"An unexpected error occurred: {e}")

    def validate(self, data_path: str, schema_path: str = 'schemas/fleet_config.json'):
        try:
            data = self.load_json(data_path)
            schema = self.load_json(schema_path)

            jsonschema.validate(instance=data, schema=schema)
            return data
        except jsonschema.exceptions.ValidationError as e:
            raise SchemaValidationException(f"Validation error: {str(e)}")
