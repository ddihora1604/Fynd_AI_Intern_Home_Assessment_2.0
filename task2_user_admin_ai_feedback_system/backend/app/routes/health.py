from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from ..schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(ok=True, service="task2-backend", time=datetime.now(timezone.utc))
