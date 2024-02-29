from fastapi import FastAPI
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi_versioning import VersionedFastAPI



app = FastAPI()


app = VersionedFastAPI(app,
    version_format='{major}',
    prefix_format='/v{major}')

app.add_middleware(
    CORSMiddleware,
    # We should specify allowed origins more restrictively in production
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def serve_client():
    return FileResponse("../client/build/index.html")

@app.get("/healthcheck")
async def health_check():
    return JSONResponse(status_code=200, content={"status": "OK"})
