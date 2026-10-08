import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Pause, Play, Square } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Badge, fieldCls, btnCls } from "../components/ui";
import { clock, elapsedMs, fmt } from "../utils/time";

const CATEGORIES = [
  "Programming",
  "Design",
  "Video Editing",
  "3D",
  "French",
  "School",
  "Reading",
  "Other",
];

function ErrorBar() {
  const { taskError, clearTaskError } = useApp();
  if (!taskError) return null;
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm"
    >
      <span>{taskError}</span>
      <button
        onClick={clearTaskError}
        aria-label="Dismiss"
        className="text-muted hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}

function Setup() {
  const { tasks, tasksStatus, loadTasks, startTimer } = useApp();
  const [params] = useSearchParams();
  const [taskId, setTaskId] = useState(params.get("task") || "");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");

  const open = tasks
    .filter((t) => !["completed", "skipped"].includes(t.status))
    .sort((a, b) => Number(b.today) - Number(a.today));
  const selected = open.find((t) => String(t.id) === taskId);

  const submit = (e) => {
    e.preventDefault();
    startTimer({
      title: selected ? selected.title : title.trim() || category,
      category,
      projectId: selected?.projectId ?? null,
      taskId: selected ? selected.id : null,
    });
  };

  return (
    <Card className="w-full max-w-lg space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Focus mode</h1>
        <p className="text-sm text-muted">
          One thing at a time. Pick what you will work on.
        </p>
      </div>

      {tasksStatus === "error" && (
        <p className="text-sm">
          We couldn&apos;t load your tasks.{" "}
          <button onClick={loadTasks} className="text-accent hover:underline">
            Try again
          </button>
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Task</span>
          <select
            value={selected ? taskId : ""}
            onChange={(e) => setTaskId(e.target.value)}
            className={`${fieldCls} w-full`}
          >
            <option value="">No task</option>
            {open.map((t) => (
              <option key={t.id} value={t.id}>
                {t.today ? "★ " : ""}
                {t.title}
              </option>
            ))}
          </select>
        </label>

        {!selected && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">What will you work on?</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Build the focus page"
              className={`${fieldCls} w-full`}
            />
          </label>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${fieldCls} w-full`}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <button className={`${btnCls} w-full justify-center`}>
          <Play size={16} aria-hidden="true" />
          Start focus
        </button>
      </form>

      <Link
        to="/today"
        className="block text-center text-sm text-muted hover:text-ink"
      >
        Back to today
      </Link>
    </Card>
  );
}

function Running() {
  const { active, tasks, pauseTimer, resumeTimer, stopTimer, discardTimer } =
    useApp();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  const [finishing, setFinishing] = useState(false);
  const [note, setNote] = useState("");
  const [complete, setComplete] = useState(false);
  const [saving, setSaving] = useState(false);

  const paused = active.resumedAt === null;

  useEffect(() => {
    if (paused) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [paused]);

  const elapsed = Math.max(0, Math.floor(elapsedMs(active, now) / 1000));
  const task = active.taskId ? tasks.find((t) => t.id === active.taskId) : null;
  const canComplete = task && task.status !== "completed";

  const finish = () => {
    pauseTimer();
    setFinishing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await stopTimer({ note, completeTask: complete });
    setSaving(false);
    if (ok) navigate("/today");
  };

  const discard = () => {
    if (window.confirm("Discard this session? The time will not be saved.")) {
      discardTimer();
      navigate("/today");
    }
  };

  if (finishing) {
    return (
      <Card className="w-full max-w-lg space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Session completed</h1>
          <p className="text-sm text-muted">
            Focus time:{" "}
            <span className="font-medium text-ink">{fmt(elapsed)}</span> on{" "}
            {active.title}
          </p>
        </div>

        <form onSubmit={save} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">
              What did you accomplish?
            </span>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`${fieldCls} w-full`}
            />
          </label>

          {canComplete && (
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={complete}
                onChange={(e) => setComplete(e.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Mark this task as completed
            </label>
          )}

          <ErrorBar />

          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={saving}
              className={`${btnCls} disabled:opacity-60`}
            >
              {saving ? "Saving..." : "Save session"}
            </button>
            <button
              type="button"
              onClick={() => setFinishing(false)}
              className="text-sm text-muted hover:text-ink"
            >
              Back to timer
            </button>
            <button
              type="button"
              onClick={discard}
              className="ms-auto text-sm text-muted hover:text-ink"
            >
              Discard
            </button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-8 text-center">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted">Focus mode</p>
        <h1 className="text-2xl font-semibold">{active.title}</h1>
        <Badge>{active.category}</Badge>
      </div>

      <p className="text-7xl font-semibold tabular-nums sm:text-8xl">
        {clock(elapsed)}
      </p>

      <p role="status" className="h-5 text-sm text-muted">
        {paused ? "Paused" : ""}
      </p>

      <ErrorBar />

      <div className="flex justify-center gap-3">
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
        <button onClick={finish} className={btnCls}>
          <Square size={16} aria-hidden="true" />
          Finish
        </button>
      </div>

      <Link
        to="/today"
        className="inline-block text-sm text-muted hover:text-ink"
      >
        Leave focus view (the timer keeps running)
      </Link>
    </div>
  );
}

export default function Focus() {
  const { active } = useApp();

  return (
    <main className="grid min-h-screen place-items-center p-4">
      {active ? <Running /> : <Setup />}
    </main>
  );
}
