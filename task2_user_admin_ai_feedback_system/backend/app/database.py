from __future__ import annotations

from supabase import Client, create_client

from .config import settings


_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.supabase_url, settings.supabase_api_key)
    return _supabase
