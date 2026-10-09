import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Pause, Play, Square } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n/useT";
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
  const { t } = useT();
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
        aria-label={t("layout.dismiss")}
        className="text-muted hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}

function Setup() {
  const { t, tc } = useT();
  const { tasks, tasksStatus, loadTasks, startTimer } = useApp();
  const [params] = useSearchParams();
  const [taskId, setTaskId] = useState(params.get("task") || "");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");

  const open = tasks
    .filter((task) => !["completed", "skipped"].includes(task.status))
    .sort((a, b) => Number(b.today) - Number(a.today));
  const selected = open.find((task) => String(task.id) === taskId);

  const submit = (e) => {
    e.preventDefault();
    startTimer({
      title: selected ? selected.title : title.trim() || tc(category),
      category,
      projectId: selected?.projectId ?? null,
      taskId: selected ? selected.id : null,
    });
  };

  return (
    <Card className="w-full max-w-lg space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">{t("time.focusMode")}</h1>
        <p className="text-sm text-muted">{t("focus.setupSub")}</p>
      </div>

      {tasksStatus === "error" && (
        <p className="text-sm">
          {t("tasks.loadError")}{" "}
          <button onClick={loadTasks} className="text-accent hover:underline">
            {t("common.tryAgain")}
          </button>
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{t("focus.task")}</span>
          <select
            value={selected ? taskId : ""}
            onChange={(e) => setTaskId(e.target.value)}
            className={`${fieldCls} w-full`}
          >
            <option value="">{t("focus.noTask")}</option>
            {open.map((task) => (
              <option key={task.id} value={task.id}>
                {task.today ? "★ " : ""}
                {task.title}
              </option>
            ))}
          </select>
        </label>

        {!selected && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t("focus.whatWork")}</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("focus.workPlaceholder")}
              className={`${fieldCls} w-full`}
            />
          </label>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{t("common.category")}</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${fieldCls} w-full`}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {tc(c)}
              </option>
            ))}
          </select>
        </label>

        <button className={`${btnCls} w-full justify-center`}>
          <Play size={16} aria-hidden="true" />
          {t("focus.start")}
        </button>
      </form>

      <Link
        to="/today"
        className="block text-center text-sm text-muted hover:text-ink"
      >
        {t("focus.backToday")}
      </Link>
    </Card>
  );
}

function Running() {
  const { t, tc } = useT();
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
  const task = active.taskId ? tasks.find((x) => x.id === active.taskId) : null;
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
    if (window.confirm(t("focus.discardConfirm"))) {
      discardTimer();
      navigate("/today");
    }
  };

  if (finishing) {
    return (
      <Card className="w-full max-w-lg space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">{t("focus.completed")}</h1>
          <p className="text-sm text-muted">
            {t("focus.summary", { time: fmt(elapsed), title: active.title })}
          </p>
        </div>

        <form onSubmit={save} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t("focus.accomplish")}</span>
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
              {t("focus.markComplete")}
            </label>
          )}

          <ErrorBar />

          <div className="flex flex-wrap items-center gap-3">
            <button
              disabled={saving}
              className={`${btnCls} disabled:opacity-60`}
            >
              {saving ? t("common.saving") : t("focus.saveSession")}
            </button>
            <button
              type="button"
              onClick={() => setFinishing(false)}
              className="text-sm text-muted hover:text-ink"
            >
              {t("focus.backTimer")}
            </button>
            <button
              type="button"
              onClick={discard}
              className="ms-auto text-sm text-muted hover:text-ink"
            >
              {t("focus.discard")}
            </button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-lg space-y-8 text-center">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted">
          {t("time.focusMode")}
        </p>
        <h1 className="text-2xl font-semibold">{active.title}</h1>
        <Badge>{tc(active.category)}</Badge>
      </div>

      <p className="text-7xl font-semibold tabular-nums sm:text-8xl" dir="ltr">
        {clock(elapsed)}
      </p>

      <p role="status" className="h-5 text-sm text-muted">
        {paused ? t("time.paused") : ""}
      </p>

      <ErrorBar />

      <div className="flex justify-center gap-3">
        {paused ? (
          <button onClick={resumeTimer} className={btnCls}>
            <Play size={16} aria-hidden="true" />
            {t("time.resume")}
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-sm font-medium"
          >
            <Pause size={16} aria-hidden="true" />
            {t("time.pause")}
          </button>
        )}
        <button onClick={finish} className={btnCls}>
          <Square size={16} aria-hidden="true" />
          {t("focus.finish")}
        </button>
      </div>

      <Link
        to="/today"
        className="inline-block text-sm text-muted hover:text-ink"
      >
        {t("focus.leave")}
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
