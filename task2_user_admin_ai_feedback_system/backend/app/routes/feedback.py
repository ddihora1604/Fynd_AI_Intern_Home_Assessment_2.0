from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from ..database import get_supabase
from ..schemas import (
    ErrorResponse,
    SubmitReviewRequest,
    SubmitReviewResponse,
    SubmissionItem,
    RetryResponse,
)
from ..services.feedback import run_llm_and_build_update

router = APIRouter(prefix="/api")


@router.post("/submit-review", response_model=SubmitReviewResponse)
async def submit_review(payload: SubmitReviewRequest):
    # Empty reviews are allowed; rating is required.
    sb = get_supabase()

    try:
        insert_resp = (
            sb.table("submissions")
            .insert({"rating": payload.rating, "review_text": payload.review, "ai_status": "pending"})
            .execute()
        )
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content=ErrorResponse(ok=False, error={"code": "SUPABASE_ERROR", "message": str(e)}).model_dump(),
        )

    data = getattr(insert_resp, "data", None) or []
    if not data or not isinstance(data, list) or not data[0].get("id"):
        return JSONResponse(
            status_code=502,
            content=ErrorResponse(ok=False, error={"code": "SUPABASE_ERROR", "message": "Insert failed"}).model_dump(),
        )

    submission_id = data[0]["id"]

    update_payload, user_ai_response = await run_llm_and_build_update(rating=payload.rating, review_text=payload.review)

    try:
        sb.table("submissions").update(update_payload).eq("id", submission_id).execute()
    except Exception:
        # Even if update fails, return a safe user response and keep the row pending.
        user_ai_response = "Thanks for your feedback. Our team will review it shortly."

    return SubmitReviewResponse(submission_id=submission_id, status="accepted", ai_response=user_ai_response)


@router.get("/submissions", response_model=list[SubmissionItem])
def list_submissions(
    limit: int = Query(default=50, ge=1, le=200),
    since: datetime | None = Query(default=None),
):
    sb = get_supabase()

    try:
        q = sb.table("submissions").select(
            "id,rating,review_text,ai_summary,ai_actions,ai_status,created_at"
        ).order("created_at", desc=True).limit(limit)
        if since is not None:
            q = q.gte("created_at", since.isoformat())

        resp = q.execute()
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content=ErrorResponse(ok=False, error={"code": "SUPABASE_ERROR", "message": str(e)}).model_dump(),
        )

    rows = getattr(resp, "data", None) or []
    items: list[SubmissionItem] = []
    for r in rows:
        items.append(
            SubmissionItem(
                id=r.get("id"),
                rating=r.get("rating"),
                review_text=r.get("review_text") or "",
                ai_summary=r.get("ai_summary") or "",
                ai_actions=list(r.get("ai_actions") or []),
                created_at=r.get("created_at"),
                ai_status=r.get("ai_status") or "pending",
            )
        )

    return items


@router.post("/retry/{submission_id}", response_model=RetryResponse)
async def retry(submission_id: str):
    sb = get_supabase()

    try:
        get_resp = (
            sb.table("submissions")
            .select("id,rating,review_text,ai_status")
            .eq("id", submission_id)
            .limit(1)
            .execute()
        )
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content=ErrorResponse(ok=False, error={"code": "SUPABASE_ERROR", "message": str(e)}).model_dump(),
        )

    rows = getattr(get_resp, "data", None) or []
    if not rows:
        return JSONResponse(
            status_code=404,
            content=ErrorResponse(ok=False, error={"code": "NOT_FOUND", "message": "Submission not found"}).model_dump(),
        )

    row = rows[0]
    rating = int(row.get("rating") or 0)
    review_text = row.get("review_text") or ""

    update_payload, _user_ai_response = await run_llm_and_build_update(rating=rating, review_text=review_text)
    try:
        sb.table("submissions").update(update_payload).eq("id", submission_id).execute()
    except Exception as e:
        return RetryResponse(
            submission_id=submission_id,
            ai_status="failed",
            ai_summary="(Supabase update failed)",
            ai_actions=[str(e)],
        )

    return RetryResponse(
        submission_id=submission_id,
        ai_status=update_payload.get("ai_status", "success"),
        ai_summary=update_payload.get("ai_summary", ""),
        ai_actions=list(update_payload.get("ai_actions") or []),
    )
