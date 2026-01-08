export default function StatusBadge({ status }) {
  const label = status || "unknown";

  const cls =
    label === "success"
      ? "badge badgeSuccess"
      : label === "pending"
        ? "badge badgePending"
        : label === "failed"
          ? "badge badgeFailed"
          : "badge";

  return <span className={cls}>{label}</span>;
}
