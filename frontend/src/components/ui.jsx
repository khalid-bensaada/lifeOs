import { useT } from "../i18n/useT";

export const Card = ({ className = "", children }) => (
  <section className={`rounded-xl border border-line bg-card p-5 ${className}`}>
    {children}
  </section>
);

export const Bar = ({ value, label }) => (
  <div
    role="progressbar"
    aria-label={label}
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={100}
    className="h-2 w-full rounded-full bg-line"
  >
    <div
      className="h-2 rounded-full bg-accent transition-[width]"
      style={{ width: `${value}%` }}
    />
  </div>
);

export function Ring({ value, size = 96 }) {
  const { t } = useT();
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={t("ui.complete", { value })}
    >
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="var(--line)"
        strokeWidth="9"
      />
      <circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontSize="22"
        fontWeight="600"
        fill="var(--ink)"
      >
        {value}%
      </text>
    </svg>
  );
}

export const Empty = ({ title, text }) => (
  <div className="rounded-xl border border-dashed border-line p-10 text-center">
    <p className="font-medium">{title}</p>
    <p className="mt-1 text-sm text-muted">{text}</p>
  </div>
);

export const Badge = ({ children }) => (
  <span className="rounded-md border border-line px-2 py-0.5 text-xs text-muted">
    {children}
  </span>
);

export const fieldCls =
  "rounded-lg border border-line bg-card px-3 py-2 text-sm";
export const btnCls =
  "inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-medium text-white hover:opacity-90";
