from fastapi import FastAPI
from .routers import dids, vcs, oac

app = FastAPI(title="ODRL API", description="API wrapper for OYDID CLI with VC Capabilities")

app.include_router(dids.router)
app.include_router(vcs.router)
app.include_router(oac.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "oydid-api"}
