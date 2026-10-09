import { Link } from "react-router-dom";
import { useApp, goalProgress } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useT } from "../i18n/useT";
import { Card, Bar, Ring, Empty, Badge, btnCls } from "../components/ui";
import { todayISO } from "../utils/dates";
import { focusSeconds, fmt } from "../utils/time";

const greetingKey = () => {
  const h = new Date().getHours();
  if (h < 12) return "dashboard.greeting.morning";
  if (h < 18) return "dashboard.greeting.afternoon";
  return "dashboard.greeting.evening";
};

export default function Dashboard() {
  const { t, tc, formatDate } = useT();
  const { user } = useAuth();
  const { tasks, goals, habits, entries, updateTask, toggleHabitLog } =
    useApp();

  const focusToday = focusSeconds(entries, 0, 1);
  const focusWeek = focusSeconds(entries, 0, 7);
  const focusPrev = focusSeconds(entries, 7, 7);
  const change = focusPrev
    ? Math.round((100 * (focusWeek - focusPrev)) / focusPrev)
    : null;
  const changeText =
    change === null ? null : `\u200E${change > 0 ? "+" : ""}${change}%`;

  const today = tasks.filter((task) => task.today);
  const done = today.filter((task) => task.status === "completed").length;
  const pct = today.length ? Math.round((100 * done) / today.length) : 0;

  const todayDate = todayISO();
  const habitsDone = habits.filter((h) => h.logs.includes(todayDate)).length;

  const date = formatDate(new Date(), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          {t(greetingKey(), { name: user.name })}
        </h1>
        <p className="text-sm text-muted">
          {t("dashboard.subtitle", { date })}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-semibold">{t("dashboard.priorities")}</h2>
          {today.length === 0 ? (
            <Empty
              title={t("dashboard.noPriorities")}
              text={t("dashboard.noPrioritiesText")}
            />
          ) : (
            <ul className="space-y-1">
              {today.map((task) => (
                <li key={task.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-line/40">
                    <input
                      type="checkbox"
                      checked={task.status === "completed"}
                      className="size-4 accent-[var(--accent)]"
                      onChange={() =>
                        updateTask(task.id, {
                          status:
                            task.status === "completed" ? "todo" : "completed",
                        })
                      }
                    />
                    <span
                      className={
                        task.status === "completed"
                          ? "text-muted line-through"
                          : ""
                      }
                    >
                      {task.title}
                    </span>
                    <span className="ms-auto">
                      <Badge>{t("common.minutes", { n: task.est })}</Badge>
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
              <h2 className="font-semibold">{t("dashboard.progress")}</h2>
              <p className="text-sm text-muted">
                {t("dashboard.tasksCompleted", {
                  done,
                  total: today.length,
                })}
              </p>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold">{t("dashboard.focusTime")}</h2>
            <p className="mt-2 text-3xl font-semibold" dir="ltr">
              {fmt(focusToday)}
            </p>
            <p className="text-sm text-muted">{t("dashboard.today")}</p>
            <div className="mt-3 border-t border-line pt-3 text-sm">
              <p>
                <span className="font-medium" dir="ltr">
                  {fmt(focusWeek)}
                </span>{" "}
                <span className="text-muted">
                  {t("dashboard.focusWeek", { time: "" }).trim()}
                </span>
              </p>
              <p className="text-muted">
                {changeText === null
                  ? t("dashboard.noPrevious")
                  : t("dashboard.vsPrevious", { change: changeText })}
              </p>
            </div>
            <Link
              to="/time"
              className="mt-3 inline-block text-sm text-accent hover:underline"
            >
              {t("dashboard.openTime")}
            </Link>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">{t("dashboard.habits")}</h2>
              <span className="text-sm text-muted">
                {t("dashboard.habitsCompleted", {
                  done: habitsDone,
                  total: habits.length,
                })}
              </span>
            </div>
            {habits.length === 0 ? (
              <Empty
                title={t("dashboard.noHabits")}
                text={t("dashboard.noHabitsText")}
              />
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
              {t("dashboard.viewHabits")}
            </Link>
          </Card>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">{t("dashboard.goals")}</h2>
          <Link to="/goals" className="text-sm text-accent hover:underline">
            {t("dashboard.viewGoals")}
          </Link>
        </div>
        {goals.length === 0 ? (
          <Empty
            title={t("dashboard.noGoals")}
            text={t("dashboard.noGoalsText")}
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2">
            {goals.slice(0, 4).map((g) => (
              <li key={g.id} className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">{g.title}</span>
                  <span className="text-sm text-muted" dir="ltr">
                    {goalProgress(g)}%
                  </span>
                </div>
                <Bar value={goalProgress(g)} label={g.title} />
                <p className="text-xs text-muted">
                  {t("goals.due", { date: g.deadline || t("goals.noDate") })} ·{" "}
                  {tc(g.category)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/tasks" className={btnCls}>
          {t("dashboard.addTask")}
        </Link>
        <Link to="/goals" className={btnCls}>
          {t("dashboard.addGoal")}
        </Link>
        <Link to="/habits" className={btnCls}>
          {t("dashboard.addHabit")}
        </Link>
      </div>
    </div>
  );
}
