from __future__ import annotations

import json
from dataclasses import dataclass

import httpx

from ..config import settings


@dataclass
class LlmResult:
    model: str
    user_response: str
    summary: str
    actions: list[str]


def _truncate(text: str, max_chars: int) -> tuple[str, bool]:
    if len(text) <= max_chars:
        return text, False
    return text[:max_chars] + "\n\n[TRUNCATED]", True


async def generate_outputs(rating: int, review_text: str) -> LlmResult:
    review_text = (review_text or "").strip()

    if not review_text:
        return LlmResult(
            model=settings.cerebras_model,
            user_response="Thanks for your rating. If you add a short note, we can act on it faster.",
            summary="Empty review (no text provided).",
            actions=["Ask user for brief details", "Log as low-information feedback"],
        )

    truncated, _was_truncated = _truncate(review_text, settings.max_llm_input_chars)

    system = (
        "You are an assistant for a business handling customer feedback. "
        "Return ONLY valid JSON with this schema: "
        '{"user_response":"...", "summary":"...", "recommended_actions":["...", "..."]}. '
        "Rules: concise, no markdown."
    )

    user = (
        f"Customer rating: {rating}/5\n"
        "Customer review text:\n"
        f"{truncated}\n\n"
        "Task: (1) helpful user-facing response, (2) 1-2 sentence summary, (3) 3-6 recommended next actions."
    )

    api_key = settings.cerebras_api_key
    if not api_key:
        raise RuntimeError("Missing CEREBRAS_API_KEY on backend")

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            "https://api.cerebras.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": settings.cerebras_model,
                "temperature": 0.2,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            },
        )

    if resp.status_code >= 400:
        raise RuntimeError(f"LLM HTTP {resp.status_code}: {resp.text}")

    data = resp.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content")
    if not content:
        raise RuntimeError("LLM returned empty content")

    try:
        parsed = json.loads(content)
    except Exception as e:
        raise RuntimeError("LLM returned non-JSON content") from e

    user_response = str(parsed.get("user_response", "")).strip()
    summary = str(parsed.get("summary", "")).strip()
    actions = parsed.get("recommended_actions")

    if not user_response or not summary or not isinstance(actions, list) or not actions:
        raise RuntimeError("LLM JSON missing required fields")

    actions_out: list[str] = [str(a).strip() for a in actions if str(a).strip()]
    actions_out = actions_out[:8]

    return LlmResult(
        model=settings.cerebras_model,
        user_response=user_response,
        summary=summary,
        actions=actions_out,
    )
