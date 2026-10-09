import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n/useT";
import { Card, Bar, Badge, fieldCls, btnCls } from "../components/ui";

const STATUSES = [
  "idea",
  "planning",
  "in_progress",
  "paused",
  "completed",
  "archived",
];

const progressOf = (list) => {
  const counted = list.filter((task) => task.status !== "skipped");
  if (!counted.length) return 0;
  return Math.round(
    (100 * counted.filter((task) => task.status === "completed").length) /
      counted.length,
  );
};

function ProjectCard({ p }) {
  const { t } = useT();
  const { tasks, goals, updateProject, removeProject, addTask, updateTask } =
    useApp();
  const [title, setTitle] = useState("");
  const mine = tasks.filter((task) => task.projectId === p.id);
  const done = mine.filter((task) => task.status === "completed").length;
  const goal = goals.find((g) => String(g.id) === String(p.goalId));

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await addTask({
      title: title.trim(),
      priority: "medium",
      est: 30,
      projectId: p.id,
    });
    if (ok) setTitle("");
  };

  return (
    <Card className="space-y-3 !p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{p.title}</h3>
        <button
          onClick={() => removeProject(p.id)}
          aria-label={t("common.deleteItem", { title: p.title })}
          className="text-muted hover:text-ink"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {p.tech && <Badge>{p.tech}</Badge>}
        {goal && (
          <Badge>{t("projects.goalBadge", { title: goal.title })}</Badge>
        )}
        {p.deadline && <Badge>{t("goals.due", { date: p.deadline })}</Badge>}
      </div>

      {mine.length === 0 ? (
        <p className="text-xs text-muted">{t("projects.noTasks")}</p>
      ) : (
        <div className="space-y-1">
          <Bar
            value={progressOf(mine)}
            label={t("common.progressOf", { title: p.title })}
          />
          <p className="text-xs text-muted">
            {t("projects.tasksProgress", {
              done,
              total: mine.length,
              pct: progressOf(mine),
            })}
          </p>
        </div>
      )}

      <select
        aria-label={t("projects.statusOf", { title: p.title })}
        value={p.status}
        onChange={(e) => updateProject(p.id, { status: e.target.value })}
        className={`${fieldCls} w-full !py-1.5`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {t(`projectStatus.${s}`)}
          </option>
        ))}
      </select>

      {mine.length > 0 && (
        <ul className="space-y-1">
          {mine.map((task) => (
            <li key={task.id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={task.status === "completed"}
                  onChange={() =>
                    updateTask(task.id, {
                      status:
                        task.status === "completed" ? "todo" : "completed",
                    })
                  }
                  className="size-4 accent-[var(--accent)]"
                />
                <span
                  className={
                    task.status === "completed" ? "text-muted line-through" : ""
                  }
                >
                  {task.title}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="flex gap-2">
        <input
          aria-label={t("projects.newTaskFor", { title: p.title })}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("projects.addTaskPlaceholder")}
          className={`${fieldCls} min-w-0 flex-1 !py-1.5`}
        />
        <button
          className={btnCls}
          aria-label={t("projects.addTaskTo", { title: p.title })}
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </form>
    </Card>
  );
}

export default function Projects() {
  const { t } = useT();
  const { projects, projectsStatus, loadProjects, goals, addProject } =
    useApp();
  const [title, setTitle] = useState("");
  const [tech, setTech] = useState("");
  const [goalId, setGoalId] = useState("");
  const [deadline, setDeadline] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await addProject({
      title: title.trim(),
      tech: tech.trim(),
      goalId,
      deadline,
    });
    if (ok) {
      setTitle("");
      setTech("");
      setGoalId("");
      setDeadline("");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("nav.projects")}</h1>
        <p className="text-sm text-muted">{t("projects.subtitle")}</p>
      </header>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label={t("projects.nameLabel")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("projects.placeholder")}
          className={`${fieldCls} min-w-0 flex-1`}
        />
        <input
          aria-label={t("projects.techLabel")}
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          placeholder={t("projects.techLabel")}
          className={`${fieldCls} w-40`}
        />
        <select
          aria-label={t("projects.goalLabel")}
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          className={fieldCls}
        >
          <option value="">{t("projects.noGoal")}</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
        <input
          aria-label={t("common.deadline")}
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={fieldCls}
        />
        <button className={btnCls}>
          <Plus size={16} aria-hidden="true" />
          {t("projects.addProject")}
        </button>
      </form>

      {projectsStatus === "loading" && (
        <div aria-busy="true" className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 w-72 shrink-0 animate-pulse rounded-xl bg-line/60"
            />
          ))}
        </div>
      )}

      {projectsStatus === "error" && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-medium">{t("common.somethingWrong")}</p>
          <p className="mt-1 text-sm text-muted">{t("projects.loadError")}</p>
          <button onClick={loadProjects} className={`${btnCls} mt-4`}>
            {t("common.tryAgain")}
          </button>
        </div>
      )}

      {projectsStatus === "ready" && (
        <div className="flex items-start gap-4 overflow-x-auto pb-3">
          {STATUSES.map((key) => {
            const list = projects.filter((p) => p.status === key);
            return (
              <section
                key={key}
                aria-label={t(`projectStatus.${key}`)}
                className="w-72 shrink-0 space-y-3"
              >
                <h2 className="flex items-center justify-between px-1 text-sm font-semibold">
                  {t(`projectStatus.${key}`)}
                  <span className="font-normal text-muted">{list.length}</span>
                </h2>
                {list.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-muted">
                    {t("projects.noProjects")}
                  </p>
                ) : (
                  list.map((p) => <ProjectCard key={p.id} p={p} />)
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
