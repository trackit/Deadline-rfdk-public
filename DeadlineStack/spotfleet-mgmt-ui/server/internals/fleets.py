from services.backup import Backup
from services.schema_validator import SchemaValidator


class FleetsInternal:
    def create_fleet(deadline_config_path: str, output_backup_path: str, config_schema_path: str = "schemas/fleet_config.json"):
        data = SchemaValidator().validate(deadline_config_path, config_schema_path)
        backup_result = Backup().create(deadline_config_path, output_backup_path)

        return data, backup_result
