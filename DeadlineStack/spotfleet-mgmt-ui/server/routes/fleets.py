from fastapi import APIRouter, HTTPException
from services.backup import Backup
from services.schema_validator import SchemaValidator, SchemaValidationException

router = APIRouter(
    prefix="/fleets",
    tags=["fleets-mgmt"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", status_code=200)
async def get_fleets():
    return {"body": []}


@router.get("/{fleet_id}", status_code=200)
async def get_fleet(fleet_id: str):
    return {"body": fleet_id}


@router.post("/", status_code=200)
async def create_fleet(deadline_config_path: str, output_backup_path: str, config_schema_path: str = "schemas/fleet_config.json"):
    try:
        data = SchemaValidator().validate(deadline_config_path, config_schema_path)
        backup_result = Backup().create(deadline_config_path, output_backup_path)

        if backup_result:
            return {"status": "ok", "backup_path": backup_result, "fleet_data": data}
        else:
            raise HTTPException(
                status_code=500, detail="Backup creation failed.")
    except SchemaValidationException as e:
        raise HTTPException(
            status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing the request: {str(e)}")


@router.put("/{fleet_id}", status_code=200)
async def update_fleet(fleet_id: str):
    return {"body": f"{fleet_id} updated"}


@router.delete("/{fleet_id}", status_code=200)
async def delete_fleet(fleet_id: str):
    return {"body": f"{fleet_id} deleted"}
