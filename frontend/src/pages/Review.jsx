import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, Badge, Empty, fieldCls, btnCls } from "../components/ui";
import { fromISO, addDays, startOfWeek, todayISO } from "../utils/dates";
import { fmt } from "../utils/time";
import { weekStats } from "../utils/review";

const QUESTIONS = [
  ["wentWell", "What went well?"],
  ["wentBad", "What went badly?"],
  ["wasted", "What wasted my time?"],
  ["learned", "What did I learn?"],
  ["change", "What should I change next week?"],
];

const MAX = 5;

const rangeLabel = (w) => {
  const f = (iso) =>
    fromISO(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  return `${f(w)} – ${f(addDays(w, 6))}`;
};

const Stat = ({ label, value }) => (
  <div>
    <p className="text-lg font-semibold">{value}</p>
    <p className="text-xs text-muted">{label}</p>
  </div>
);

const StatsGrid = ({ s }) => (
  <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
    <Stat label="Productivity" value={s.score} />
    <Stat label="Focus time" value={fmt(s.focus)} />
    <Stat label="Tasks" value={`${s.tasksDone} / ${s.tasksTotal}`} />
    <Stat label="Habits" value={`${s.habits}%`} />
    <Stat
      label="Gym"
      value={`${s.workouts} ${s.workouts === 1 ? "session" : "sessions"}`}
    />
    <Stat label="Learning" value={fmt(s.learning)} />
  </div>
);

function ReviewForm() {
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
    (t) => !["completed", "skipped"].includes(t.status),
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
    const t = custom.trim();
    if (!t) return;
    toggle(t);
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
        <h1 className="text-2xl font-semibold">Weekly Review</h1>
        <p className="text-sm text-muted">
          Week of {rangeLabel(week)}. Look back, then decide what to change.
          Nothing here is required.
        </p>
      </header>

      <Card className="space-y-4">
        <h2 className="font-semibold">Your last 7 days</h2>
        <StatsGrid s={stats} />
      </Card>

      <form onSubmit={submit} className="space-y-6">
        <Card className="space-y-4">
          {QUESTIONS.map(([key, question]) => (
            <label key={key} className="block space-y-1.5">
              <span className="text-sm font-medium">{question}</span>
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
            <h2 className="font-semibold">Priorities for next week</h2>
            <span className="text-sm text-muted">
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
                    aria-label={`Remove ${p}`}
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
              <p className="text-sm text-muted">Pick from your open tasks:</p>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label="Open tasks"
              >
                {open.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => toggle(t.title)}
                    aria-pressed={priorities.includes(t.title)}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      priorities.includes(t.title)
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-line text-muted"
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              aria-label="Custom priority"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustom(e);
              }}
              placeholder="Or write your own priority"
              className={`${fieldCls} min-w-0 flex-1`}
            />
            <button type="button" onClick={addCustom} className={btnCls}>
              Add
            </button>
          </div>
          {priorities.length >= MAX && (
            <p className="text-sm text-muted">
              Five is the limit. Remove one to add another.
            </p>
          )}
        </Card>

        <div className="flex items-center gap-4">
          <button disabled={saving} className={`${btnCls} disabled:opacity-60`}>
            {saving ? "Saving..." : existing ? "Update review" : "Save review"}
          </button>
          {saved && (
            <p role="status" className="text-sm text-accent">
              Review saved.
            </p>
          )}
        </div>
      </form>

      <Card className="space-y-3">
        <h2 className="font-semibold">Past reviews</h2>
        {reviews.length === 0 ? (
          <Empty
            title="No reviews yet"
            text="Your first review will appear here once you save it."
          />
        ) : (
          reviews.map((r) => (
            <details
              key={r.id}
              className="rounded-lg border border-line px-3 py-2"
            >
              <summary className="cursor-pointer text-sm font-medium">
                {rangeLabel(r.weekStart)}{" "}
                <span className="font-normal text-muted">
                  · score {r.stats.score}
                </span>
                {r.weekStart === week && (
                  <>
                    {" "}
                    <Badge>This week</Badge>
                  </>
                )}
              </summary>
              <div className="mt-3 space-y-4">
                <StatsGrid s={r.stats} />
                {QUESTIONS.filter(([k]) => r.answers[k]).map(([k, q]) => (
                  <div key={k}>
                    <p className="text-sm font-medium">{q}</p>
                    <p className="whitespace-pre-wrap text-sm text-muted">
                      {r.answers[k]}
                    </p>
                  </div>
                ))}
                {r.priorities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">
                      Priorities for next week
                    </p>
                    <ul className="list-disc pl-5 text-sm text-muted">
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
        <p className="font-medium">Something went wrong.</p>
        <p className="mt-1 text-sm text-muted">
          We couldn&apos;t load the data for your review.
        </p>
        <button onClick={retry} className={`${btnCls} mt-4`}>
          Try again
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
