import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n/useT";
import { Card, Badge, Empty, fieldCls, btnCls } from "../components/ui";
import { fromISO, addDays, startOfWeek, todayISO } from "../utils/dates";
import { fmt } from "../utils/time";
import { weekStats } from "../utils/review";

const QUESTIONS = ["wentWell", "wentBad", "wasted", "learned", "change"];

const MAX = 5;

const rangeLabel = (formatDate, weekStart) => {
  const f = (iso) =>
    formatDate(fromISO(iso), { day: "numeric", month: "short" });
  return `${f(weekStart)} – ${f(addDays(weekStart, 6))}`;
};

const Stat = ({ label, value }) => (
  <div>
    <p className="text-lg font-semibold" dir="ltr">
      {value}
    </p>
    <p className="text-xs text-muted">{label}</p>
  </div>
);

function StatsGrid({ s }) {
  const { t } = useT();
  return (
    <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
      <Stat label={t("review.productivity")} value={s.score} />
      <Stat label={t("dashboard.focusTime")} value={fmt(s.focus)} />
      <Stat label={t("nav.tasks")} value={`${s.tasksDone} / ${s.tasksTotal}`} />
      <Stat label={t("nav.habits")} value={`${s.habits}%`} />
      <Stat label={t("review.gym")} value={s.workouts} />
      <Stat label={t("review.learning")} value={fmt(s.learning)} />
    </div>
  );
}

function ReviewForm() {
  const { t, formatDate } = useT();
  const { tasks, habits, entries, goals, reviews, saveReview } = useApp();
  const week = startOfWeek(todayISO());
  const existing = reviews.find((r) => r.weekStart === week);
  const stats = weekStats({ tasks, habits, entries, goals });

  const [answers, setAnswers] = useState(() => existing?.answers || {});
  const [priorities, setPriorities] = useState(
    () => existing?.priorities || [],
  );
  const [custom, setCustom] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const open = tasks.filter(
    (task) => !["completed", "skipped"].includes(task.status),
  );

  const toggle = (title) => {
    setSaved(false);
    setPriorities((p) =>
      p.includes(title)
        ? p.filter((x) => x !== title)
        : p.length >= MAX
          ? p
          : [...p, title],
    );
  };

  const addCustom = (e) => {
    e.preventDefault();
    const text = custom.trim();
    if (!text) return;
    toggle(text);
    setCustom("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await saveReview({
      weekStart: week,
      answers,
      priorities,
      stats,
    });
    setSaving(false);
    setSaved(ok === true);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("nav.review")}</h1>
        <p className="text-sm text-muted">
          {t("review.subtitle", { range: rangeLabel(formatDate, week) })}
        </p>
      </header>

      <Card className="space-y-4">
        <h2 className="font-semibold">{t("review.last7")}</h2>
        <StatsGrid s={stats} />
      </Card>

      <form onSubmit={submit} className="space-y-6">
        <Card className="space-y-4">
          {QUESTIONS.map((key) => (
            <label key={key} className="block space-y-1.5">
              <span className="text-sm font-medium">
                {t(`review.q.${key}`)}
              </span>
              <textarea
                rows={3}
                value={answers[key] || ""}
                onChange={(e) => {
                  setSaved(false);
                  setAnswers((a) => ({ ...a, [key]: e.target.value }));
                }}
                className={`${fieldCls} w-full`}
              />
            </label>
          ))}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">{t("review.priorities")}</h2>
            <span className="text-sm text-muted" dir="ltr">
              {priorities.length} / {MAX}
            </span>
          </div>

          {priorities.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {priorities.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2 rounded-lg border border-accent bg-accent/10 px-3 py-1 text-sm text-accent"
                >
                  {p}
                  <button
                    type="button"
                    onClick={() => toggle(p)}
                    aria-label={t("common.removeItem", { title: p })}
                    className="font-medium"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {open.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-muted">{t("review.pickOpen")}</p>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={t("today.openTasks")}
              >
                {open.map((task) => (
                  <button
                    type="button"
                    key={task.id}
                    onClick={() => toggle(task.title)}
                    aria-pressed={priorities.includes(task.title)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      priorities.includes(task.title)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-line text-muted"
                    }`}
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              aria-label={t("review.customLabel")}
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustom(e);
              }}
              placeholder={t("review.customPlaceholder")}
              className={`${fieldCls} min-w-0 flex-1`}
            />
            <button type="button" onClick={addCustom} className={btnCls}>
              {t("common.add")}
            </button>
          </div>
          {priorities.length >= MAX && (
            <p className="text-sm text-muted">{t("review.limitNote")}</p>
          )}
        </Card>

        <div className="flex items-center gap-4">
          <button disabled={saving} className={`${btnCls} disabled:opacity-60`}>
            {saving
              ? t("common.saving")
              : existing
                ? t("common.updateReview")
                : t("common.saveReview")}
          </button>
          {saved && (
            <p role="status" className="text-sm text-accent">
              {t("review.saved")}
            </p>
          )}
        </div>
      </form>

      <Card className="space-y-3">
        <h2 className="font-semibold">{t("review.past")}</h2>
        {reviews.length === 0 ? (
          <Empty title={t("review.noPast")} text={t("review.noPastText")} />
        ) : (
          reviews.map((r) => (
            <details
              key={r.id}
              className="rounded-lg border border-line px-3 py-2"
            >
              <summary className="cursor-pointer text-sm font-medium">
                {rangeLabel(formatDate, r.weekStart)}{" "}
                <span className="font-normal text-muted">
                  · {t("review.score", { n: r.stats.score })}
                </span>
                {r.weekStart === week && (
                  <>
                    {" "}
                    <Badge>{t("review.thisWeek")}</Badge>
                  </>
                )}
              </summary>
              <div className="mt-3 space-y-4">
                <StatsGrid s={r.stats} />
                {QUESTIONS.filter((k) => r.answers[k]).map((k) => (
                  <div key={k}>
                    <p className="text-sm font-medium">{t(`review.q.${k}`)}</p>
                    <p className="whitespace-pre-wrap text-sm text-muted">
                      {r.answers[k]}
                    </p>
                  </div>
                ))}
                {r.priorities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">
                      {t("review.priorities")}
                    </p>
                    <ul className="list-disc ps-5 text-sm text-muted">
                      {r.priorities.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          ))
        )}
      </Card>
    </div>
  );
}

export default function Review() {
  const { t } = useT();
  const {
    reviewsStatus,
    tasksStatus,
    habitsStatus,
    entriesStatus,
    goalsStatus,
    loadReviews,
    loadTasks,
    loadHabits,
    loadEntries,
    loadGoals,
  } = useApp();

  const statuses = [
    reviewsStatus,
    tasksStatus,
    habitsStatus,
    entriesStatus,
    goalsStatus,
  ];

  const retry = () => {
    loadReviews();
    loadTasks();
    loadHabits();
    loadEntries();
    loadGoals();
  };

  if (statuses.includes("error")) {
    return (
      <div className="rounded-xl border border-dashed border-line p-10 text-center">
        <p className="font-medium">{t("common.somethingWrong")}</p>
        <p className="mt-1 text-sm text-muted">{t("review.loadError")}</p>
        <button onClick={retry} className={`${btnCls} mt-4`}>
          {t("common.tryAgain")}
        </button>
      </div>
    );
  }

  if (statuses.includes("loading")) {
    return (
      <div aria-busy="true" className="space-y-4">
        <div className="h-24 animate-pulse rounded-xl bg-line/60" />
        <div className="h-64 animate-pulse rounded-xl bg-line/60" />
      </div>
    );
  }

  return <ReviewForm />;
}
