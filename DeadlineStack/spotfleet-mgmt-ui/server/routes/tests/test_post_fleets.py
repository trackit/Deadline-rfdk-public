import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[2]))
from fastapi.testclient import TestClient
from ...main import app, API_PREFIX

client = TestClient(app)

deadline_config_path = "server/schemas/config_exemple.json"
deadline_invalid_config_path = "server/schemas/invalid_config_exemple.json"
output_backup_path = "server/schemas/backup.json"
fleet_config_path = "server/schemas/fleet_config.json"


def test_post_fleets_valid_data():
    response = client.post(
        f"{API_PREFIX}/fleets",
        params={
            "deadline_config_path": deadline_config_path,
            "output_backup_path": output_backup_path,
            "config_schema_path": fleet_config_path,
        },
    )
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "ok"


def test_post_fleets_invalid_schema():
    response = client.post(
        f"{API_PREFIX}/fleets",
        params={
            "deadline_config_path": deadline_invalid_config_path,
            "output_backup_path": output_backup_path,
            "config_schema_path": fleet_config_path,
        },
    )
    assert response.status_code == 422
    assert "detail" in response.json()
    assert "Validation error" in response.json()["detail"]


def test_post_fleets_invalid_input():
    response = client.post(
        f"{API_PREFIX}/fleets",
        params={
            "deadline_config_path": "invalid_path",
            "output_backup_path": output_backup_path,
            "config_schema_path": fleet_config_path,
        },
    )
    assert response.status_code == 422
    assert "detail" in response.json()
    assert "File not found" in response.json()["detail"]


def test_post_fleets_invalid_output():
    response = client.post(
        f"{API_PREFIX}/fleets",
        params={
            "deadline_config_path": deadline_config_path,
            "output_backup_path": deadline_config_path,
            "config_schema_path": fleet_config_path,
        },
    )
    assert response.status_code == 422
    assert "detail" in response.json()
    assert "Failed to create backup:" in response.json()["detail"]
