import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n/useT";
import { Card, Bar, Empty } from "../components/ui";
import { lastDays, todayISO } from "../utils/dates";
import { fmt, FOCUS } from "../utils/time";
import { rate, streaks } from "../utils/habits";
import { computeScore, focusByDay } from "../utils/stats";

const RANGES = [
  { days: 7, labelKey: "time.last7" },
  { days: 30, labelKey: "time.last30" },
];

const Stat = ({ label, value }) => (
  <div>
    <p className="text-lg font-semibold" dir="ltr">
      {value}
    </p>
    <p className="text-xs text-muted">{label}</p>
  </div>
);

const sum = (list) => list.reduce((n, x) => n + x.seconds, 0);

export default function Statistics() {
  const { t, tc, shortDay } = useT();
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
  const count = (s) => tasks.filter((task) => task.status === s).length;
  const overdue = tasks.filter(
    (task) =>
      task.due &&
      task.due < today &&
      !["completed", "skipped"].includes(task.status),
  ).length;
  const counted = tasks.filter((task) => task.status !== "skipped");
  const taskRate = counted.length
    ? Math.round((100 * count("completed")) / counted.length)
    : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("nav.stats")}</h1>
          <p className="text-sm text-muted">{t("stats.subtitle")}</p>
        </div>
        <div
          className="flex gap-2"
          role="group"
          aria-label={t("stats.periodLabel")}
        >
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
              {t(r.labelKey)}
            </button>
          ))}
        </div>
      </header>

      <Card className="grid gap-6 md:grid-cols-3">
        <div>
          <h2 className="font-semibold">{t("stats.score")}</h2>
          <p className="mt-2 text-5xl font-semibold" dir="ltr">
            {score}
          </p>
          <p className="mt-2 text-sm text-muted">{t("stats.scoreText")}</p>
        </div>
        <ul className="space-y-3 md:col-span-2">
          {parts.map((p) => (
            <li key={p.key} className="space-y-1">
              <div className="flex justify-between gap-3 text-sm">
                <span>
                  {t(`stats.part.${p.key}`)}{" "}
                  <span className="text-muted">
                    · {t(`stats.hint.${p.key}`)}
                  </span>
                </span>
                <span className="shrink-0 font-medium" dir="ltr">
                  +{p.value} / {p.max}
                </span>
              </div>
              <Bar
                value={Math.round((100 * p.value) / p.max)}
                label={t("stats.partScore", { part: t(`stats.part.${p.key}`) })}
              />
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-semibold">{t("nav.tasks")}</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label={t("status.completed")} value={count("completed")} />
            <Stat
              label={t("status.in_progress")}
              value={count("in_progress")}
            />
            <Stat label={t("status.todo")} value={count("todo")} />
            <Stat label={t("status.skipped")} value={count("skipped")} />
            <Stat label={t("stats.overdue")} value={overdue} />
            <Stat label={t("stats.completionRate")} value={`${taskRate}%`} />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold">{t("stats.time")}</h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label={t("stats.totalTracked")} value={fmt(total)} />
            <Stat label={t("stats.focus")} value={fmt(focus)} />
            <Stat label={tc("Entertainment")} value={fmt(entertainment)} />
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <h2 className="font-semibold">{t("stats.focusByDay")}</h2>
        {focus === 0 ? (
          <Empty title={t("stats.noFocus")} text={t("stats.noFocusText")} />
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
                chart.map((c) => <span key={c.date}>{shortDay(c.date)}</span>)
              ) : (
                <>
                  <span dir="ltr">{chart[0].date}</span>
                  <span dir="ltr">{chart[chart.length - 1].date}</span>
                </>
              )}
            </div>
          </>
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="font-semibold">{t("nav.habits")}</h2>
        {habits.length === 0 ? (
          <Empty title={t("habits.empty")} text={t("stats.noHabitsText")} />
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
                      {t("stats.habitRow", {
                        rate: r,
                        current: t("common.daysShort", { n: current }),
                        best: t("common.daysShort", { n: best }),
                      })}
                    </span>
                  </div>
                  <Bar
                    value={r}
                    label={t("common.progressOf", { title: h.name })}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
