import asyncio
import structlog
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from sqlalchemy import text

from config import settings
from storage.db import AsyncSessionLocal
from storage.redis_client import get_redis

log = structlog.get_logger()

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    return {"status": "ok", "env": settings.APP_ENV}


@router.get("/health/detail")
async def health_detail():
    results: dict = {
        "status": "ok",
        "env": settings.APP_ENV,
        "db": "ok",
        "redis": "ok",
        "checks": {},
    }

    # DB check
    try:
        async with AsyncSessionLocal() as s:
            await asyncio.wait_for(s.execute(text("SELECT 1")), timeout=2.0)
    except Exception as e:
        results["db"] = "error"
        results["checks"]["db"] = str(e)
        log.error("health_db_failed", error=str(e))

    # Redis check
    try:
        r = get_redis()
        await asyncio.wait_for(r.ping(), timeout=2.0)
    except Exception as e:
        results["redis"] = "error"
        results["checks"]["redis"] = str(e)
        log.error("health_redis_failed", error=str(e))

    if any(v == "error" for v in [results["db"], results["redis"]]):
        results["status"] = "degraded"
        return JSONResponse(status_code=503, content=results)

    return results
