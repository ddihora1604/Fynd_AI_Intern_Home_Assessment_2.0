from __future__ import annotations

from ..llm.client import generate_outputs


async def run_llm_and_build_update(*, rating: int, review_text: str) -> tuple[dict, str]:
    """Run LLM and return (supabase_update_payload, user_ai_response).

    Never raises: on failure returns ai_status='failed' and a safe fallback user response.
    """

    try:
        llm = await generate_outputs(rating, review_text)
        update_payload = {
            "ai_response": llm.user_response,
            "ai_summary": llm.summary,
            "ai_actions": llm.actions,
            "ai_status": "success",
        }
        return update_payload, llm.user_response
    except Exception:
        fallback = "Thanks for your feedback. Our team will review it shortly."
        update_payload = {
            "ai_response": fallback,
            "ai_summary": "(LLM failed)",
            "ai_actions": ["Review manually"],
            "ai_status": "failed",
        }
        return update_payload, fallback
