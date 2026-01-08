const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

function requireBackendUrl() {
  if (!BACKEND_URL) {
    throw new Error("Missing NEXT_PUBLIC_BACKEND_URL");
  }
  return BACKEND_URL;
}

export async function submitReview({ rating, review, user_id }) {
  const base = requireBackendUrl();
  const resp = await fetch(`${base}/api/submit-review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, review, user_id })
  });

  const data = await resp.json().catch(() => null);
  return { ok: resp.ok, status: resp.status, data };
}

export async function fetchSubmissions({ limit = 50 } = {}) {
  const base = requireBackendUrl();
  const resp = await fetch(`${base}/api/submissions?limit=${limit}`, { cache: "no-store" });
  const data = await resp.json().catch(() => null);
  return { ok: resp.ok, status: resp.status, data };
}

export async function retrySubmission(submissionId) {
  const base = requireBackendUrl();
  const resp = await fetch(`${base}/api/retry/${submissionId}`, { method: "POST" });
  const data = await resp.json().catch(() => null);
  return { ok: resp.ok, status: resp.status, data };
}
