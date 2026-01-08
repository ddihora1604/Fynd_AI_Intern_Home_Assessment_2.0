"use client";

import { useEffect, useMemo, useState } from "react";
import AdminTable from "../../components/AdminTable";
import { fetchSubmissions, retrySubmission } from "../../lib/api";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState([]);
  const [counts, setCounts] = useState({});
  const [filterRating, setFilterRating] = useState("all");
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

  const visible = useMemo(() => {
    if (filterRating === "all") return submissions;
    const r = Number(filterRating);
    return submissions.filter((x) => x.rating === r);
  }, [submissions, filterRating]);

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
    <main>
      <h1 style={{ marginBottom: 6 }}>Admin Dashboard</h1>
      <div className="muted" style={{ marginBottom: 16 }}>
        Auto-refreshes every 5 seconds.
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div style={{ width: 280 }}>
            <div className="muted">Filter by rating</div>
            <select className="select" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
              <option value="all">All</option>
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={String(r)}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <div className="muted">Counts by rating</div>
            <div className="row" style={{ flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5].map((r) => (
                <div key={r} className="badge">
                  {r}★: {counts[String(r)] ?? 0}
                </div>
              ))}
            </div>
          </div>

          <button className="btnSecondary" type="button" onClick={load}>
            Refresh
          </button>
        </div>

        {error && <div style={{ marginTop: 12, color: "#991b1b" }}>Error: {error}</div>}
      </div>

      <AdminTable submissions={visible} onRetry={onRetry} retryingId={retryingId} />

      <div className="muted" style={{ marginTop: 16 }}>
        User view: <a href="/">/</a>
      </div>
    </main>
  );
}
