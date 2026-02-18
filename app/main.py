from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from .routers import dids, vcs, oac

app = FastAPI(title="ODRL API", description="API wrapper for OYDID CLI with VC Capabilities")

# API Routers with /api prefix
app.include_router(dids.router, prefix="/api")
app.include_router(vcs.router, prefix="/api")
app.include_router(oac.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "oydid-api"}

# Serve Frontend Static Files
# Mount the static directory (built React app)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

# Catch-all route for SPA (React Router)
@app.exception_handler(404)
async def custom_404_handler(request, __):
    if os.path.exists(os.path.join(static_dir, "index.html")):
        return FileResponse(os.path.join(static_dir, "index.html"))
    return {"detail": "Not Found"}
