from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    ok: Literal[False]
    error: ErrorDetail


class SubmitReviewRequest(BaseModel):
    user_id: str | None = Field(default=None, description="Optional user id")
    rating: int = Field(..., ge=1, le=5)
    review: str = Field(default="", max_length=8000)

    @field_validator("review")
    @classmethod
    def normalize_review(cls, value: str) -> str:
        return (value or "").strip()


class SubmitReviewResponse(BaseModel):
    submission_id: str
    status: Literal["accepted"]
    ai_response: str


class SubmissionItem(BaseModel):
    id: str
    rating: int
    review_text: str
    ai_summary: str
    ai_actions: list[str]
    created_at: datetime
    ai_status: Literal["pending", "success", "failed"]


class RetryResponse(BaseModel):
    submission_id: str
    ai_status: Literal["success", "failed"]
    ai_summary: str
    ai_actions: list[str]


class CountsByRatingResponse(BaseModel):
    counts_by_rating: dict[str, int]


class HealthResponse(BaseModel):
    ok: Literal[True]
    service: str
    time: datetime


def schema_json(model: type[BaseModel]) -> dict[str, Any]:
    return model.model_json_schema()
