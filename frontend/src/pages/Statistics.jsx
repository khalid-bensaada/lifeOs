import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card, Bar, Empty } from "../components/ui";
import { lastDays, dayName, todayISO } from "../utils/dates";
import { fmt, FOCUS } from "../utils/time";
import { rate, streaks } from "../utils/habits";
import { computeScore, focusByDay } from "../utils/stats";

const RANGES = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
];

const Stat = ({ label, value }) => (
  <div>
    <p className="text-lg font-semibold">{value}</p>
    <p className="text-xs text-muted">{label}</p>
  </div>
);

const sum = (list) => list.reduce((n, x) => n + x.seconds, 0);

export default function Statistics() {
  const { tasks, habits, entries, goals } = useApp();
  const [days, setDays] = useState(7);

  const set = new Set(lastDays(days));
  const inRange = entries.filter((x) => set.has(x.date));
  const total = sum(inRange);
  const focus = sum(inRange.filter((x) => FOCUS.includes(x.category)));
  const entertainment = sum(
    inRange.filter((x) => x.category === "Entertainment"),
  );

  const { total: score, parts } = computeScore(
    { tasks, habits, entries, goals },
    days,
  );
  const chart = focusByDay(entries, days);
  const max = Math.max(...chart.map((c) => c.seconds), 1);

  const today = todayISO();
  const count = (s) => tasks.filter((t) => t.status === s).length;
  const overdue = tasks.filter(
    (t) =>
      t.due && t.due < today && !["completed", "skipped"].includes(t.status),
  ).length;
  const counted = tasks.filter((t) => t.status !== "skipped");
  const taskRate = counted.length
    ? Math.round((100 * count("completed")) / counted.length)
    : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Statistics</h1>
          <p className="text-sm text-muted">
            Numbers to help you adjust, not to judge you.
          </p>
        </div>
        <div className="flex gap-2" role="group" aria-label="Period">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              aria-pressed={days === r.days}
              className={`rounded-full border px-3 py-1 text-sm ${
                days === r.days
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-muted"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <Card className="grid gap-6 md:grid-cols-3">
        <div>
          <h2 className="font-semibold">Productivity score</h2>
          <p className="mt-2 text-5xl font-semibold">{score}</p>
          <p className="mt-2 text-sm text-muted">
            A snapshot of this period, built from the five parts on the right.
            It is not a grade.
          </p>
        </div>
        <ul className="space-y-3 md:col-span-2">
          {parts.map((p) => (
            <li key={p.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>
                  {p.label} <span className="text-muted">· {p.hint}</span>
                </span>
                <span className="font-medium">
                  +{p.value} / {p.max}
                </span>
              </div>
              <Bar
                value={Math.round((100 * p.value) / p.max)}
                label={`${p.label} score`}
              />
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-semibold">Tasks</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Completed" value={count("completed")} />
            <Stat label="In progress" value={count("in_progress")} />
            <Stat label="Todo" value={count("todo")} />
            <Stat label="Skipped" value={count("skipped")} />
            <Stat label="Overdue" value={overdue} />
            <Stat label="Completion rate" value={`${taskRate}%`} />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold">Time</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Total tracked" value={fmt(total)} />
            <Stat label="Focus" value={fmt(focus)} />
            <Stat label="Entertainment" value={fmt(entertainment)} />
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <h2 className="font-semibold">Focus time by day</h2>
        {focus === 0 ? (
          <Empty
            title="No focus time in this period"
            text="Track a session to see it here."
          />
        ) : (
          <>
            <div className="flex h-40 items-end gap-1" role="list">
              {chart.map((c) => (
                <div
                  key={c.date}
                  role="listitem"
                  className="flex h-full min-w-0 flex-1 items-end"
                  title={`${c.date}: ${fmt(c.seconds)}`}
                  aria-label={`${c.date}: ${fmt(c.seconds)}`}
                >
                  <div
                    className="w-full rounded-t bg-accent"
                    style={{
                      height: `${Math.max(2, (100 * c.seconds) / max)}%`,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted">
              {days === 7 ? (
                chart.map((c) => <span key={c.date}>{dayName(c.date)}</span>)
              ) : (
                <>
                  <span>{chart[0].date}</span>
                  <span>{chart[chart.length - 1].date}</span>
                </>
              )}
            </div>
          </>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-semibold">Habits</h2>
        {habits.length === 0 ? (
          <Empty
            title="No habits yet"
            text="Add a habit to see how consistent you are."
          />
        ) : (
          <ul className="space-y-4">
            {habits.map((h) => {
              const r = rate(h.logs, days);
              const { current, best } = streaks(h.logs);
              return (
                <li key={h.id} className="space-y-1">
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span>{h.name}</span>
                    <span className="text-muted">
                      {r}% · current {current}d · best {best}d
                    </span>
                  </div>
                  <Bar value={r} label={`${h.name} completion`} />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
