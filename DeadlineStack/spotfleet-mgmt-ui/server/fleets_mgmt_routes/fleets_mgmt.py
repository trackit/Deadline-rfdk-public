from fastapi import APIRouter

router = APIRouter(
    prefix="/fleets",
    tags=["fleets-mgmt"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def get_fleets():
    return {"body": []}


@router.get("/{fleet_id}")
async def get_fleet(fleet_id: str):
    return {"body": fleet_id}


@router.post("/")
async def create_fleet():
    return {"body": "new"}


@router.put("/{fleet_id}")
async def update_fleet(fleet_id: str):
    return {"body": f"{fleet_id} updated"}


@router.delete("/{fleet_id}")
async def delete_fleet(fleet_id: str):
    return {"body": f"{fleet_id} deleted"}
