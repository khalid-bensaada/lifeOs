import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Bar, Badge, fieldCls, btnCls } from "../components/ui";

const STATUS = {
  idea: "Idea",
  planning: "Planning",
  in_progress: "In progress",
  paused: "Paused",
  completed: "Completed",
  archived: "Archived",
};

const progressOf = (list) => {
  const counted = list.filter((t) => t.status !== "skipped");
  if (!counted.length) return 0;
  return Math.round(
    (100 * counted.filter((t) => t.status === "completed").length) /
      counted.length,
  );
};

function ProjectCard({ p }) {
  const { tasks, goals, updateProject, removeProject, addTask, updateTask } =
    useApp();
  const [title, setTitle] = useState("");
  const mine = tasks.filter((t) => t.projectId === p.id);
  const done = mine.filter((t) => t.status === "completed").length;
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
          aria-label={`Delete ${p.title}`}
          className="text-muted hover:text-ink"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {p.tech && <Badge>{p.tech}</Badge>}
        {goal && <Badge>Goal: {goal.title}</Badge>}
        {p.deadline && <Badge>Due {p.deadline}</Badge>}
      </div>

      {mine.length === 0 ? (
        <p className="text-xs text-muted">No tasks yet</p>
      ) : (
        <div className="space-y-1">
          <Bar value={progressOf(mine)} label={`${p.title} progress`} />
          <p className="text-xs text-muted">
            {done} / {mine.length} tasks · {progressOf(mine)}%
          </p>
        </div>
      )}

      <select
        aria-label={`Status of ${p.title}`}
        value={p.status}
        onChange={(e) => updateProject(p.id, { status: e.target.value })}
        className={`${fieldCls} w-full !py-1.5`}
      >
        {Object.entries(STATUS).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>

      {mine.length > 0 && (
        <ul className="space-y-1">
          {mine.map((t) => (
            <li key={t.id}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={t.status === "completed"}
                  onChange={() =>
                    updateTask(t.id, {
                      status: t.status === "completed" ? "todo" : "completed",
                    })
                  }
                  className="size-4 accent-[var(--accent)]"
                />
                <span
                  className={
                    t.status === "completed" ? "text-muted line-through" : ""
                  }
                >
                  {t.title}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="flex gap-2">
        <input
          aria-label={`New task for ${p.title}`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          className={`${fieldCls} min-w-0 flex-1 !py-1.5`}
        />
        <button className={btnCls} aria-label={`Add task to ${p.title}`}>
          <Plus size={16} aria-hidden="true" />
        </button>
      </form>
    </Card>
  );
}

export default function Projects() {
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
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-muted">
          Progress comes from each project&apos;s completed tasks. Move a
          project between columns with its status menu.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label="Project name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to build?"
          className={`${fieldCls} min-w-0 flex-1`}
        />
        <input
          aria-label="Technology"
          value={tech}
          onChange={(e) => setTech(e.target.value)}
          placeholder="Technology"
          className={`${fieldCls} w-40`}
        />
        <select
          aria-label="Goal"
          value={goalId}
          onChange={(e) => setGoalId(e.target.value)}
          className={fieldCls}
        >
          <option value="">No goal</option>
          {goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
        <input
          aria-label="Deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={fieldCls}
        />
        <button className={btnCls}>
          <Plus size={16} aria-hidden="true" />
          Add project
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
          <p className="font-medium">Something went wrong.</p>
          <p className="mt-1 text-sm text-muted">
            We couldn&apos;t load your projects.
          </p>
          <button onClick={loadProjects} className={`${btnCls} mt-4`}>
            Try again
          </button>
        </div>
      )}

      {projectsStatus === "ready" && (
        <div className="flex items-start gap-4 overflow-x-auto pb-3">
          {Object.entries(STATUS).map(([key, label]) => {
            const list = projects.filter((p) => p.status === key);
            return (
              <section
                key={key}
                aria-label={label}
                className="w-72 shrink-0 space-y-3"
              >
                <h2 className="flex items-center justify-between px-1 text-sm font-semibold">
                  {label}
                  <span className="font-normal text-muted">{list.length}</span>
                </h2>
                {list.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-muted">
                    No projects
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
