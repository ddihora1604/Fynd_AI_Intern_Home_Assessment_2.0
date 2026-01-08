import StatusBadge from "./StatusBadge";

export default function AdminTable({ submissions, onRetry, retryingId }) {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Submissions</h2>
      <table className="table">
        <thead>
          <tr>
            {[
              "Time",
              "Rating",
              "Review",
              "AI Summary",
              "Recommended actions",
              "Status",
              ""
            ].map((h) => (
              <th key={h} className="th">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id}>
              <td className="td" style={{ whiteSpace: "nowrap" }}>
                {new Date(s.created_at).toLocaleString()}
              </td>
              <td className="td">{s.rating}</td>
              <td className="td" style={{ width: "32%" }}>
                {s.review_text ? s.review_text : <i className="muted">(empty)</i>}
              </td>
              <td className="td" style={{ width: "25%" }}>
                {s.ai_summary}
              </td>
              <td className="td">
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {(s.ai_actions || []).map((a, idx) => (
                    <li key={idx}>{a}</li>
                  ))}
                </ul>
              </td>
              <td className="td">
                <StatusBadge status={s.ai_status} />
              </td>
              <td className="td">
                {s.ai_status === "failed" ? (
                  <button
                    className="btnSecondary"
                    type="button"
                    onClick={() => onRetry(s.id)}
                    disabled={retryingId === s.id}
                  >
                    {retryingId === s.id ? "Retrying..." : "Retry"}
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
