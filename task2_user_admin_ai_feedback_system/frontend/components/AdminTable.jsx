import StatusBadge from "./StatusBadge";

export default function AdminTable({ submissions, onRetry, retryingId }) {
  return (
    <div className="card tableCard">
      <h2 className="tableHeader" style={{ marginTop: 0 }}>
        <span style={{ marginRight: 10 }}>📋</span>
        Submissions
        <span className="submissionCount">{submissions.length} total</span>
      </h2>
      <table className="table" style={{ tableLayout: "fixed", width: "100%" }}>
        <colgroup>
          <col style={{ width: "12%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "26%" }} />
          <col style={{ width: "10%" }} />
        </colgroup>
        <thead>
          <tr>
            <th className="th">🕐 Time</th>
            <th className="th">⭐ Rating</th>
            <th className="th">💬 User Review</th>
            <th className="th">🤖 AI Summary</th>
            <th className="th">✅ Recommended Actions</th>
            <th className="th">📊 Status</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id}>
              <td className="td tdTime">
                {new Date(s.created_at).toLocaleDateString()}<br/>
                <span className="timeSmall">{new Date(s.created_at).toLocaleTimeString()}</span>
              </td>
              <td className="td" style={{ textAlign: "center" }}>
                <span className="ratingCell">{s.rating}★</span>
              </td>
              <td className="td">
                {s.review_text ? s.review_text : <i className="muted">(empty)</i>}
              </td>
              <td className="td">
                {s.ai_summary}
              </td>
              <td className="td">
                <ul className="actionsList">
                  {(s.ai_actions || []).map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </td>
              <td className="td" style={{ textAlign: "center" }}>
                <div className="statusCell">
                  <StatusBadge status={s.ai_status} />
                  {s.ai_status === "failed" && (
                    <button
                      className="btnRetry"
                      type="button"
                      onClick={() => onRetry(s.id)}
                      disabled={retryingId === s.id}
                    >
                      {retryingId === s.id ? "..." : "🔄 Retry"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
