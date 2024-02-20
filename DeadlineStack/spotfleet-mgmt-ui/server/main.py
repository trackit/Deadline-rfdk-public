from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    # We should specify allowed origins more restrictively in production
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/", StaticFiles(directory="build", html=True), name="static")


@app.get("/", response_class=HTMLResponse)
async def serve_client():
    return FileResponse("build/index.html")
