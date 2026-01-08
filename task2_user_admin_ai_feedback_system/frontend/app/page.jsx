"use client";

import { useState } from "react";
import ReviewForm from "../components/ReviewForm";
import { submitReview } from "../lib/api";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function onSubmit({ rating, review }) {
    setLoading(true);
    setAiResponse(null);
    setMessage(null);
    setError(null);

    try {
      const { ok, data } = await submitReview({ rating, review });
      if (!ok) {
        setError(data?.error?.message || "Submission failed");
        return;
      }

      setAiResponse(data.ai_response);
      setMessage("Submitted successfully.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1 style={{ marginBottom: 6 }}>User Dashboard</h1>
      <div className="muted" style={{ marginBottom: 16 }}>
        Submit a rating + review. You will see an AI-generated response.
      </div>

      <ReviewForm onSubmit={onSubmit} loading={loading} />

      {(message || error || aiResponse) && (
        <div className="card" style={{ marginTop: 16 }}>
          {message && <div style={{ color: "#065f46", marginBottom: 8 }}>{message}</div>}
          {error && <div style={{ color: "#991b1b", marginBottom: 8 }}>Error: {error}</div>}
          {aiResponse && (
            <>
              <div className="muted">AI response</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{aiResponse}</div>
            </>
          )}
        </div>
      )}

      <div className="muted" style={{ marginTop: 16 }}>
        Admin view: <a href="/admin">/admin</a>
      </div>
    </main>
  );
}
