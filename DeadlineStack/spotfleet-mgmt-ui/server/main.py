from fastapi import FastAPI, APIRouter
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routes.fleets import router as fleets_router

API_PREFIX = "/api/v1"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    # We should specify allowed origins more restrictively in production
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
router = APIRouter(
    prefix=API_PREFIX,
)

@router.get("/", response_class=HTMLResponse)
async def serve_client():
    return FileResponse("build/index.html")

@router.get("/healthcheck")
async def health_check():
    return JSONResponse(status_code=200, content={"status": "OK"})

app.include_router(router)

app.include_router(
    fleets_router, 
    prefix=API_PREFIX,
)
