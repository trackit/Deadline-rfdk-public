from fastapi import APIRouter, FastAPI
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware


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
async def serve_client():
    return FileResponse("build/index.html")

app.include_router(
    router,
    prefix="/api/v1",
    tags=["api/v1"],
    dependencies=[],
    responses={},
)

