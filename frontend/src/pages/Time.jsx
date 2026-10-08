import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, Square, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Bar, Empty, Badge, fieldCls, btnCls } from "../components/ui";
import { lastDays } from "../utils/dates";
import { fmt, clock, elapsedMs } from "../utils/time";

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
  const { active, projects, startTimer, pauseTimer, resumeTimer, stopTimer } =
    useApp();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");
  const [projectId, setProjectId] = useState("");
  const [now, setNow] = useState(Date.now());
  const [stopping, setStopping] = useState(false);

  const paused = active ? active.resumedAt === null : false;

  useEffect(() => {
    if (!active || paused) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active, paused]);

  const submit = (e) => {
    e.preventDefault();
    startTimer({
      title: title.trim() || category,
      category,
      projectId: projectId ? Number(projectId) : null,
      taskId: null,
    });
    setTitle("");
    setProjectId("");
  };

  const stop = async () => {
    setStopping(true);
    await stopTimer();
    setStopping(false);
  };

  if (active) {
    const elapsed = Math.max(0, Math.floor(elapsedMs(active, now) / 1000));
    const project = projects.find((p) => p.id === active.projectId);
    return (
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">{active.title}</p>
            <p className="mt-1 flex gap-2">
              <Badge>{active.category}</Badge>
              {project && <Badge>{project.title}</Badge>}
              {paused && <Badge>Paused</Badge>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="text-3xl font-semibold tabular-nums"
              aria-live="off"
            >
              {clock(elapsed)}
            </span>
            {paused ? (
              <button onClick={resumeTimer} className={btnCls}>
                <Play size={16} aria-hidden="true" />
                Resume
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-medium"
              >
                <Pause size={16} aria-hidden="true" />
                Pause
              </button>
            )}
            <button
              onClick={stop}
              disabled={stopping}
              className={`${btnCls} disabled:opacity-60`}
            >
              <Square size={16} aria-hidden="true" />
              {stopping ? "Saving..." : "Stop"}
            </button>
          </div>
        </div>
        <Link
          to="/focus"
          className="inline-block text-sm text-accent hover:underline"
        >
          Open focus mode
        </Link>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">What are you working on?</h2>
        <Link to="/focus" className="text-sm text-accent hover:underline">
          Focus mode
        </Link>
      </div>
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
        <select
          aria-label="Project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className={fieldCls}
        >
          <option value="">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
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
          <span className="min-w-0 flex-1">
            <span className="block">{x.title}</span>
            {x.note && (
              <span className="block text-xs text-muted">{x.note}</span>
            )}
          </span>
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
  const { entriesStatus, loadEntries } = useApp();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Time Tracker</h1>
        <p className="text-sm text-muted">
          Track your time to see where it actually goes.
        </p>
      </header>

      <Timer />

      {entriesStatus === "loading" && (
        <div aria-busy="true" className="space-y-3">
          <div className="h-48 animate-pulse rounded-xl bg-line/60" />
          <div className="h-32 animate-pulse rounded-xl bg-line/60" />
        </div>
      )}

      {entriesStatus === "error" && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-medium">Something went wrong.</p>
          <p className="mt-1 text-sm text-muted">
            We couldn&apos;t load your tracked time.
          </p>
          <button onClick={loadEntries} className={`${btnCls} mt-4`}>
            Try again
          </button>
        </div>
      )}

      {entriesStatus === "ready" && (
        <>
          <Summary />
          <Recent />
        </>
      )}
    </div>
  );
}
