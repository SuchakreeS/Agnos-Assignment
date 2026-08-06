// Shows patient status: Actively Filling / Idle / Not Started / Submitted.
const STATUS_CONFIG = {
  "not-started": {
    emoji: "🔴",
    label: "Not Started",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  filling: {
    emoji: "🟢",
    label: "Actively Filling",
    className: "border-green-200 bg-green-50 text-green-700",
  },
  idle: {
    emoji: "🟡",
    label: "Idle",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  submitted: {
    emoji: "✅",
    label: "Submitted",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

export default function StatusIndicator({ status }) {
  const { emoji, label, className } =
    STATUS_CONFIG[status] ?? STATUS_CONFIG["not-started"];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${className}`}
    >
      <span aria-hidden="true">{emoji}</span>
      {label}
    </span>
  );
}
