import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp, goalProgress } from "../context/AppContext";
import { Card, Bar, Badge, Empty, btnCls } from "../components/ui";
import { FOCUS, fmt } from "../utils/time";
import { streaks } from "../utils/habits";
import { LEVEL_NAMES, currentLevel, skillProgress } from "../utils/skills";

const Stat = ({ label, value }) => (
  <Card className="!p-4">
    <p className="text-2xl font-semibold">{value}</p>
    <p className="text-xs text-muted">{label}</p>
  </Card>
);

export default function Profile() {
  const { user } = useAuth();
  const {
    goals,
    goalsStatus,
    loadGoals,
    projects,
    projectsStatus,
    loadProjects,
    habits,
    habitsStatus,
    loadHabits,
    entries,
    entriesStatus,
    loadEntries,
    skills,
    skillsStatus,
    loadSkills,
    tasks,
    tasksStatus,
    loadTasks,
  } = useApp();

  const statuses = [
    goalsStatus,
    projectsStatus,
    habitsStatus,
    entriesStatus,
    skillsStatus,
    tasksStatus,
  ];

  const retry = () => {
    loadGoals();
    loadProjects();
    loadHabits();
    loadEntries();
    loadSkills();
    loadTasks();
  };

  const header = (
    <Card className="flex items-center gap-4">
      <div
        aria-hidden="true"
        className="grid size-14 shrink-0 place-items-center rounded-full bg-accent/10 text-xl font-semibold text-accent"
      >
        {user.name.trim().charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold">{user.name}</h1>
        <p className="truncate text-sm text-muted">{user.email}</p>
      </div>
    </Card>
  );

  if (statuses.includes("error")) {
    return (
      <div className="space-y-6">
        {header}
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-medium">Something went wrong.</p>
          <p className="mt-1 text-sm text-muted">
            We couldn&apos;t load your profile data.
          </p>
          <button onClick={retry} className={`${btnCls} mt-4`}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (statuses.includes("loading")) {
    return (
      <div className="space-y-6">
        {header}
        <div
          aria-busy="true"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-line/60" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-xl bg-line/60" />
      </div>
    );
  }

  const focusTotal = entries
    .filter((x) => FOCUS.includes(x.category))
    .reduce((n, x) => n + x.seconds, 0);

  const current = Math.max(0, ...habits.map((h) => streaks(h.logs).current));
  const best = Math.max(0, ...habits.map((h) => streaks(h.logs).best));
  const projectsDone = projects.filter((p) => p.status === "completed").length;
  const tasksDone = tasks.filter((t) => t.status === "completed").length;

  const mainGoals = goals.filter((g) => g.status === "active").slice(0, 5);
  const learning = skills.filter((k) => !currentLevel(k).mastered);

  return (
    <div className="space-y-6">
      {header}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Focus time (last 90 days)" value={fmt(focusTotal)} />
        <Stat label="Current habit streak" value={`${current}d`} />
        <Stat label="Best habit streak" value={`${best}d`} />
        <Stat label="Projects completed" value={projectsDone} />
        <Stat label="Tasks completed" value={tasksDone} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Main goals</h2>
            <Link to="/goals" className="text-sm text-accent hover:underline">
              Open goals
            </Link>
          </div>
          {mainGoals.length === 0 ? (
            <Empty
              title="No active goals"
              text="Create a goal to give your days a direction."
            />
          ) : (
            <ul className="space-y-4">
              {mainGoals.map((g) => (
                <li key={g.id} className="space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span>{g.title}</span>
                    <span className="text-muted">{goalProgress(g)}%</span>
                  </div>
                  <Bar value={goalProgress(g)} label={`${g.title} progress`} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Skills I am learning</h2>
            <Link to="/skills" className="text-sm text-accent hover:underline">
              Open skills
            </Link>
          </div>
          {learning.length === 0 ? (
            <Empty
              title={
                skills.length === 0
                  ? "No skills yet"
                  : "Every skill is complete"
              }
              text={
                skills.length === 0
                  ? "Add a skill you want to learn."
                  : "Add a new skill to keep growing."
              }
            />
          ) : (
            <ul className="space-y-4">
              {learning.map((k) => {
                const level = currentLevel(k);
                return (
                  <li key={k.id} className="space-y-1.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                      <span>{k.name}</span>
                      <Badge>
                        Level {level.index + 1} · {LEVEL_NAMES[level.index]}
                      </Badge>
                    </div>
                    <Bar
                      value={skillProgress(k)}
                      label={`${k.name} progress`}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
