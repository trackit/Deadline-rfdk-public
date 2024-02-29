from fastapi import FastAPI, APIRouter
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .routes.fleets_mgmt_routes import router as fleets_mgmt_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # We should specify allowed origins more restrictively in production
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router= APIRouter()

@router.get("/", response_class=HTMLResponse)
app.include_router(fleets_mgmt_router)

@app.get("/", response_class=HTMLResponse)
async def serve_client():
    return FileResponse("build/index.html")

app.include_router(
    router,
    prefix="/api/v1",
    tags=["api/v1"],
    dependencies=[],
    responses={},
)


@app.get("/healthcheck")
async def health_check():
    return JSONResponse(status_code=200, content={"status": "OK"})

