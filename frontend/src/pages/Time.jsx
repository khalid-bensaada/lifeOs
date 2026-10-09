import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, Square, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n/useT";
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
  { key: "today", labelKey: "time.today", days: 1 },
  { key: "week", labelKey: "time.last7", days: 7 },
  { key: "month", labelKey: "time.last30", days: 30 },
];

function Timer() {
  const { t, tc } = useT();
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
      title: title.trim() || tc(category),
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
              <Badge>{tc(active.category)}</Badge>
              {project && <Badge>{project.title}</Badge>}
              {paused && <Badge>{t("time.paused")}</Badge>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="text-3xl font-semibold tabular-nums"
              dir="ltr"
              aria-live="off"
            >
              {clock(elapsed)}
            </span>
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
            <button
              onClick={stop}
              disabled={stopping}
              className={`${btnCls} disabled:opacity-60`}
            >
              <Square size={16} aria-hidden="true" />
              {stopping ? t("common.saving") : t("time.stop")}
            </button>
          </div>
        </div>
        <Link
          to="/focus"
          className="inline-block text-sm text-accent hover:underline"
        >
          {t("time.openFocus")}
        </Link>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">{t("time.whatWorking")}</h2>
        <Link to="/focus" className="text-sm text-accent hover:underline">
          {t("time.focusMode")}
        </Link>
      </div>
      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label={t("time.whatLabel")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("time.titlePlaceholder")}
          className={`${fieldCls} min-w-0 flex-1`}
        />
        <select
          aria-label={t("common.category")}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={fieldCls}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {tc(c)}
            </option>
          ))}
        </select>
        <select
          aria-label={t("time.project")}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className={fieldCls}
        >
          <option value="">{t("time.noProject")}</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <button className={btnCls}>
          <Play size={16} aria-hidden="true" />
          {t("time.start")}
        </button>
      </form>
    </Card>
  );
}

function Summary() {
  const { t, tc } = useT();
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
        <h2 className="font-semibold">{t("time.whereTime")}</h2>
        <div
          className="flex gap-2"
          role="group"
          aria-label={t("time.rangeLabel")}
        >
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
              {t(r.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {byCategory.length === 0 ? (
        <Empty title={t("time.noTracked")} text={t("time.noTrackedText")} />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-semibold" dir="ltr">
                {fmt(total)}
              </p>
              <p className="text-xs text-muted">{t("time.total")}</p>
            </div>
            <div>
              <p className="text-lg font-semibold" dir="ltr">
                {fmt(total - wasted)}
              </p>
              <p className="text-xs text-muted">{t("time.productive")}</p>
            </div>
            <div>
              <p className="text-lg font-semibold" dir="ltr">
                {fmt(wasted)}
              </p>
              <p className="text-xs text-muted">{tc("Entertainment")}</p>
            </div>
          </div>

          <ul className="space-y-3">
            {byCategory.map(([cat, secs]) => (
              <li key={cat} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{tc(cat)}</span>
                  <span className="text-muted" dir="ltr">
                    {fmt(secs)}
                  </span>
                </div>
                <Bar
                  value={Math.round((100 * secs) / max)}
                  label={t("time.categoryTime", { cat: tc(cat) })}
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
  const { t, tc } = useT();
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
          <Badge>{tc(x.category)}</Badge>
          <span className="text-sm text-muted" dir="ltr">
            {x.date}
          </span>
          <span className="w-16 text-end text-sm font-medium" dir="ltr">
            {fmt(x.seconds)}
          </span>
          <button
            onClick={() => removeEntry(x.id)}
            aria-label={t("common.deleteItem", { title: x.title })}
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
  const { t } = useT();
  const { entriesStatus, loadEntries } = useApp();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("nav.time")}</h1>
        <p className="text-sm text-muted">{t("time.subtitle")}</p>
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
          <p className="font-medium">{t("common.somethingWrong")}</p>
          <p className="mt-1 text-sm text-muted">{t("time.loadError")}</p>
          <button onClick={loadEntries} className={`${btnCls} mt-4`}>
            {t("common.tryAgain")}
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
