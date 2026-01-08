"use client";

import { useState, useRef, useEffect } from "react";
import ReviewForm from "../components/ReviewForm";
import { submitReview } from "../lib/api";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const responseSectionRef = useRef(null);

  // Auto-scroll to response section when AI response is received
  useEffect(() => {
    if ((aiResponse || error) && responseSectionRef.current) {
      setTimeout(() => {
        responseSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [aiResponse, error]);

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
    <main className="pageShell">
      <div className="pageHeader">
        <h1 className="pageTitle">
          <span style={{ marginRight: 12 }}>📝</span>
          User Dashboard
          <span style={{ marginLeft: 12 }}>💬</span>
        </h1>
        <div className="muted">Share your experience with our product or service by giving a rating and a short review. Our AI will instantly analyze your feedback and respond with a helpful message.</div>
      </div>

      <ReviewForm onSubmit={onSubmit} loading={loading} />

      {(message || error || aiResponse) && (
        <div className="responseSection" ref={responseSectionRef}>
          {message && (
            <div className="successCard">
              <span className="successIcon">✅</span>
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="errorCard">
              <span className="errorIcon">⚠️</span>
              <span>Error: {error}</span>
            </div>
          )}
          {aiResponse && (
            <div className="aiCard">
              <div className="aiCardHeader">
                <span className="aiCardIcon">🤖</span>
                <span className="aiCardTitle">AI Response</span>
              </div>
              <div className="aiCardBody">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
