"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTable from "../../components/AdminTable";
import { fetchSubmissions, retrySubmission } from "../../lib/api";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState([]);
  const [counts, setCounts] = useState({});
  const [filterRating, setFilterRating] = useState("all");
  const [filterSentiment, setFilterSentiment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState(null);
  const [retryingId, setRetryingId] = useState(null);

  async function load() {
    setError(null);

    const s = await fetchSubmissions({ limit: 100 });

    if (!s.ok) {
      setError(s.data?.error?.message || "Failed to load submissions");
    } else {
      setSubmissions(Array.isArray(s.data) ? s.data : []);
    }

    // Minimal analytics: counts by rating computed client-side.
    const nextCounts = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    for (const row of Array.isArray(s.data) ? s.data : []) {
      const key = String(row.rating);
      if (nextCounts[key] !== undefined) nextCounts[key] += 1;
    }
    setCounts(nextCounts);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  // Helper to determine sentiment from rating
  const getSentiment = (rating) => {
    if (rating >= 4) return "positive";
    if (rating === 3) return "neutral";
    return "negative";
  };

  // Compute analytics
  const analytics = useMemo(() => {
    const total = submissions.length;
    const positive = submissions.filter((s) => s.rating >= 4).length;
    const neutral = submissions.filter((s) => s.rating === 3).length;
    const negative = submissions.filter((s) => s.rating <= 2).length;
    const avgRating = total > 0 ? (submissions.reduce((sum, s) => sum + s.rating, 0) / total).toFixed(1) : "0.0";
    const successCount = submissions.filter((s) => s.ai_status === "success").length;
    const pendingCount = submissions.filter((s) => s.ai_status === "pending").length;
    const failedCount = submissions.filter((s) => s.ai_status === "failed").length;
    const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
    
    return { total, positive, neutral, negative, avgRating, successCount, pendingCount, failedCount, successRate };
  }, [submissions]);

  const visible = useMemo(() => {
    return submissions.filter((x) => {
      // Rating filter
      if (filterRating !== "all" && x.rating !== Number(filterRating)) return false;
      // Sentiment filter
      if (filterSentiment !== "all" && getSentiment(x.rating) !== filterSentiment) return false;
      // Status filter
      if (filterStatus !== "all" && x.ai_status !== filterStatus) return false;
      return true;
    });
  }, [submissions, filterRating, filterSentiment, filterStatus]);

  async function onRetry(id) {
    setRetryingId(id);
    try {
      await retrySubmission(id);
      await load();
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <main className="pageShell pageShellWide">
      <div className="pageHeader">
        <h1 className="pageTitle">
          <span style={{ marginRight: 12 }}>📊</span>
          Admin Dashboard
          <span style={{ marginLeft: 12 }}>⚙️</span>
        </h1>
        <div className="muted">
          <span className="liveIndicator">🔴 Live</span>Monitors all user submissions and AI analysis in real-time.
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="analyticsGrid">
        <div className="statCard">
          <div className="statIcon">📝</div>
          <div className="statContent">
            <div className="statValue">{analytics.total}</div>
            <div className="statLabel">Total Submissions</div>
          </div>
        </div>
        <div className="statCard statCardHighlight">
          <div className="statIcon">⭐</div>
          <div className="statContent">
            <div className="statValue">{analytics.avgRating}</div>
            <div className="statLabel">Avg. Rating</div>
          </div>
        </div>
        <div className="statCard statCardSuccess">
          <div className="statIcon">😊</div>
          <div className="statContent">
            <div className="statValue">{analytics.positive}</div>
            <div className="statLabel">Positive (4-5★)</div>
          </div>
        </div>
        <div className="statCard statCardWarning">
          <div className="statIcon">😐</div>
          <div className="statContent">
            <div className="statValue">{analytics.neutral}</div>
            <div className="statLabel">Neutral (3★)</div>
          </div>
        </div>
        <div className="statCard statCardDanger">
          <div className="statIcon">😞</div>
          <div className="statContent">
            <div className="statValue">{analytics.negative}</div>
            <div className="statLabel">Negative (1-2★)</div>
          </div>
        </div>
        <div className="statCard">
          <div className="statIcon">✅</div>
          <div className="statContent">
            <div className="statValue">{analytics.successRate}%</div>
            <div className="statLabel">AI Success Rate</div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card toolbarCard" style={{ marginBottom: 16 }}>
        <div className="topBar">
          <div className="topBarLeft">
            <div className="filterGroup">
              <div className="muted">🔍 Rating</div>
              <select className="select selectCompact" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                <option value="all">All Ratings</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={String(r)}>
                    {r} Star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="filterGroup">
              <div className="muted">💭 Sentiment</div>
              <select className="select selectCompact" value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)}>
                <option value="all">All Sentiments</option>
                <option value="positive">😊 Positive</option>
                <option value="neutral">😐 Neutral</option>
                <option value="negative">😞 Negative</option>
              </select>
            </div>

            <div className="filterGroup">
              <div className="muted">🤖 AI Status</div>
              <select className="select selectCompact" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="success">✅ Success</option>
                <option value="pending">⏳ Pending</option>
                <option value="failed">❌ Failed</option>
              </select>
            </div>

            <div className="filterGroup">
              <div className="muted" style={{ marginBottom: 6 }}>📈 Distribution</div>
              <div className="countsRow">
                {[1, 2, 3, 4, 5].map((r) => (
                  <span key={r} className={`countBadge countBadge${r}`}>
                    {r}★ <strong>{counts[String(r)] ?? 0}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="toolbarRight">
            <div className="filterResults">
              Showing <strong>{visible.length}</strong> of {submissions.length}
            </div>
            <button className="btnSecondary refreshBtn" type="button" onClick={load}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && <div className="alertError" style={{ marginTop: 12 }}>⚠️ Error: {error}</div>}
      </div>

      <AdminTable submissions={visible} onRetry={onRetry} retryingId={retryingId} />
    </main>
  );
}
