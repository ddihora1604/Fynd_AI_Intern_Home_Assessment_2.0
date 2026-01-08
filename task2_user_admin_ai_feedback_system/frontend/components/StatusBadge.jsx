export default function StatusBadge({ status }) {
  const label = status || "unknown";
  return <span className="badge">{label}</span>;
}
