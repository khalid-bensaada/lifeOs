import { Link } from "react-router-dom";
import { useApp, goalProgress } from "../context/AppContext";
import { Card, Bar, Ring, Empty, Badge, btnCls } from "../components/ui";
import { todayISO } from "../utils/dates";
import { focusSeconds, fmt } from "../utils/time";
import { useAuth } from "../context/AuthContext";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export default function Dashboard() {
  const { tasks, goals, habits, entries, updateTask, toggleHabitLog } =
    useApp();
  const { user } = useAuth();

  const focusToday = focusSeconds(entries, 0, 1);
  const focusWeek = focusSeconds(entries, 0, 7);
  const focusPrev = focusSeconds(entries, 7, 7);
  const change = focusPrev
    ? Math.round((100 * (focusWeek - focusPrev)) / focusPrev)
    : null;

  const today = tasks.filter((t) => t.today);
  const done = today.filter((t) => t.status === "completed").length;
  const pct = today.length ? Math.round((100 * done) / today.length) : 0;

  const todayDate = todayISO();
  const habitsDone = habits.filter((h) => h.logs.includes(todayDate)).length;

  const date = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          {greeting()}, {user.name}.
        </h1>
        <p className="text-sm text-muted">
          {date}. Focus on what matters today.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">Today&apos;s priorities</h2>
          {today.length === 0 ? (
            <Empty
              title="No priorities for today"
              text="Pick 3 to 5 tasks that matter most."
            />
          ) : (
            <ul className="space-y-1">
              {today.map((t) => (
                <li key={t.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-line/40">
                    <input
                      type="checkbox"
                      checked={t.status === "completed"}
                      className="size-4 accent-[var(--accent)]"
                      onChange={() =>
                        updateTask(t.id, {
                          status:
                            t.status === "completed" ? "todo" : "completed",
                        })
                      }
                    />
                    <span
                      className={
                        t.status === "completed"
                          ? "text-muted line-through"
                          : ""
                      }
                    >
                      {t.title}
                    </span>
                    <span className="ml-auto">
                      <Badge>{t.est} min</Badge>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="flex items-center gap-5">
            <Ring value={pct} />
            <div>
              <h2 className="font-semibold">Today&apos;s progress</h2>
              <p className="text-sm text-muted">
                {done} / {today.length} tasks completed
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold">Focus time</h2>
            <p className="mt-2 text-3xl font-semibold">{fmt(focusToday)}</p>
            <p className="text-sm text-muted">today</p>
            <div className="mt-3 border-t border-line pt-3 text-sm">
              <p>
                <span className="font-medium">{fmt(focusWeek)}</span>
                <span className="text-muted"> in the last 7 days</span>
              </p>
              <p className="text-muted">
                {change === null
                  ? "No data for the previous 7 days"
                  : `${change > 0 ? "+" : ""}${change}% vs the previous 7 days`}
              </p>
            </div>
            <Link
              to="/time"
              className="mt-3 inline-block text-sm text-accent hover:underline"
            >
              Open time tracker
            </Link>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Habits</h2>
              <span className="text-sm text-muted">
                {habitsDone} / {habits.length} completed
              </span>
            </div>
            {habits.length === 0 ? (
              <Empty title="No habits yet" text="Start with one small habit." />
            ) : (
              <ul className="space-y-1">
                {habits.map((h) => {
                  const checked = h.logs.includes(todayDate);
                  return (
                    <li key={h.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-line/40">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleHabitLog(h.id, todayDate)}
                          className="size-4 accent-[var(--accent)]"
                        />
                        <span
                          className={checked ? "text-muted line-through" : ""}
                        >
                          {h.name}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              to="/habits"
              className="mt-3 inline-block text-sm text-accent hover:underline"
            >
              View habits
            </Link>
          </Card>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Current goals</h2>
          <Link to="/goals" className="text-sm text-accent hover:underline">
            View all goals
          </Link>
        </div>
        {goals.length === 0 ? (
          <Empty title="No goals yet" text="What do you want to achieve?" />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {goals.slice(0, 4).map((g) => (
              <li key={g.id} className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{g.title}</span>
                  <span className="text-sm text-muted">{goalProgress(g)}%</span>
                </div>
                <Bar value={goalProgress(g)} label={g.title} />
                <p className="text-xs text-muted">
                  Due {g.deadline || "no date"} · {g.category}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/tasks" className={btnCls}>
          Add task
        </Link>
        <Link to="/goals" className={btnCls}>
          Add goal
        </Link>
        <Link to="/habits" className={btnCls}>
          Add habit
        </Link>
      </div>
    </div>
  );
}
