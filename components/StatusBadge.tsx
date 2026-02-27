type StatusBadgeProps = {
  status: "success" | "warning" | "error" | "info";
  label: string;
};

const styleMap = {
  success: "bg-emerald-700/30 text-emerald-300 border-emerald-700/60",
  warning: "bg-amber-700/30 text-amber-300 border-amber-700/60",
  error: "bg-rose-700/30 text-rose-300 border-rose-700/60",
  info: "bg-sky-700/30 text-sky-300 border-sky-700/60",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 text-xs font-medium ${styleMap[status]}`}
    >
      {label}
    </span>
  );
}
