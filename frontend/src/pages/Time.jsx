import { useEffect, useState } from "react";
import { Play, Square, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Bar, Empty, Badge, fieldCls, btnCls } from "../components/ui";
import { lastDays } from "../utils/dates";
import { fmt, clock } from "../utils/time";

const CATEGORIES = [
  "Programming",
  "Design",
  "Video Editing",
  "3D",
  "French",
  "School",
  "Gym",
  "Personal",
  "Reading",
  "Entertainment",
  "Other",
];

const RANGES = [
  { key: "today", label: "Today", days: 1 },
  { key: "week", label: "Last 7 days", days: 7 },
  { key: "month", label: "Last 30 days", days: 30 },
];

function Timer() {
  const { active, startTimer, stopTimer } = useApp();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");
  const [project, setProject] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);

  const submit = (e) => {
    e.preventDefault();
    startTimer({
      title: title.trim() || category,
      category,
      project: project.trim(),
    });
    setTitle("");
    setProject("");
  };

  if (active) {
    const elapsed = Math.max(0, Math.floor((now - active.startedAt) / 1000));
    return (
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold">{active.title}</p>
          <p className="mt-1 flex gap-2">
            <Badge>{active.category}</Badge>
            {active.project && <Badge>{active.project}</Badge>}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-3xl font-semibold tabular-nums" aria-live="off">
            {clock(elapsed)}
          </span>
          <button onClick={stopTimer} className={btnCls}>
            <Square size={16} aria-hidden="true" />
            Stop
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-3 font-semibold">What are you working on?</h2>
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label="What are you working on"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Build the habits page"
          className={`${fieldCls} min-w-0 flex-1`}
        />
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={fieldCls}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          aria-label="Project"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          placeholder="Project (optional)"
          className={`${fieldCls} w-44`}
        />
        <button className={btnCls}>
          <Play size={16} aria-hidden="true" />
          Start
        </button>
      </form>
    </Card>
  );
}

function Summary() {
  const { entries } = useApp();
  const [range, setRange] = useState("today");
  const days = RANGES.find((r) => r.key === range).days;
  const set = new Set(lastDays(days));
  const inRange = entries.filter((x) => set.has(x.date));

  const byCategory = Object.entries(
    inRange.reduce(
      (acc, x) => ({
        ...acc,
        [x.category]: (acc[x.category] || 0) + x.seconds,
      }),
      {},
    ),
  ).sort((a, b) => b[1] - a[1]);

  const total = inRange.reduce((n, x) => n + x.seconds, 0);
  const wasted = inRange
    .filter((x) => x.category === "Entertainment")
    .reduce((n, x) => n + x.seconds, 0);
  const max = byCategory[0]?.[1] || 1;

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Where did my time go?</h2>
        <div className="flex gap-2" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              aria-pressed={range === r.key}
              className={`rounded-full border px-3 py-1 text-sm ${
                range === r.key
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {byCategory.length === 0 ? (
        <Empty
          title="No time tracked yet"
          text="Start the timer to see where your time goes."
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-semibold">{fmt(total)}</p>
              <p className="text-xs text-muted">Total</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{fmt(total - wasted)}</p>
              <p className="text-xs text-muted">Productive</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{fmt(wasted)}</p>
              <p className="text-xs text-muted">Entertainment</p>
            </div>
          </div>

          <ul className="space-y-3">
            {byCategory.map(([cat, secs]) => (
              <li key={cat} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{cat}</span>
                  <span className="text-muted">{fmt(secs)}</span>
                </div>
                <Bar
                  value={Math.round((100 * secs) / max)}
                  label={`${cat} time`}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

function Recent() {
  const { entries, removeEntry } = useApp();
  if (!entries.length) return null;
  return (
    <Card className="divide-y divide-line !p-0">
      {entries.slice(0, 8).map((x) => (
        <div key={x.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <span className="min-w-0 flex-1">{x.title}</span>
          <Badge>{x.category}</Badge>
          <span className="text-sm text-muted">{x.date}</span>
          <span className="w-16 text-right text-sm font-medium">
            {fmt(x.seconds)}
          </span>
          <button
            onClick={() => removeEntry(x.id)}
            aria-label={`Delete ${x.title}`}
            className="text-muted hover:text-ink"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </Card>
  );
}

export default function Time() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Time Tracker</h1>
        <p className="text-sm text-muted">
          Track your time to see where it actually goes.
        </p>
      </header>
      <Timer />
      <Summary />
      <Recent />
    </div>
  );
}
