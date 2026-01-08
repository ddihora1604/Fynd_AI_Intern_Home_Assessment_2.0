import os
from pathlib import Path

from dotenv import load_dotenv


def _load_env_files() -> None:
    # Try backend-local .env first, then repo-root .env (Fynd Task/.env)
    backend_dir = Path(__file__).resolve().parent.parent
    root_dir = Path(__file__).resolve().parents[3]

    load_dotenv(backend_dir / ".env", override=False)
    load_dotenv(root_dir / ".env", override=False)


_load_env_files()


def get_env(name: str, default: str | None = None) -> str:
    value = os.getenv(name, default)
    if value is None:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


class Settings:
    def __init__(self) -> None:
        self.cerebras_api_key = os.getenv("CEREBRAS_API_KEY")
        # Hard-coded default model per assignment preference (no env var needed).
        self.cerebras_model = "llama3.1-8b"

        self.supabase_url = get_env("SUPABASE_URL")
        self.supabase_api_key = get_env("SUPABASE_API_KEY")

        self.max_review_chars = int(os.getenv("MAX_REVIEW_CHARS", "8000"))
        self.max_llm_input_chars = int(os.getenv("MAX_LLM_INPUT_CHARS", "2500"))
        self.allow_empty_review = os.getenv("ALLOW_EMPTY_REVIEW", "true").lower() == "true"


settings = Settings()
