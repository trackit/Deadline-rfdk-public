from fastapi import APIRouter
from ..services.deadline_config_services import DeadlineConfigService

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
async def create_fleet():
    DeadlineConfigService.create_backup()
    return {"body": "new"}


@router.put("/{fleet_id}", status_code=200)
async def update_fleet(fleet_id: str):
    DeadlineConfigService.create_backup()
    return {"body": f"{fleet_id} updated"}


@router.delete("/{fleet_id}", status_code=200)
async def delete_fleet(fleet_id: str):
    return {"body": f"{fleet_id} deleted"}
