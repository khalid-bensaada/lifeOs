import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n/useT";
import { Card, Empty, Badge, fieldCls, btnCls } from "../components/ui";

const STATUSES = ["todo", "in_progress", "completed", "skipped"];
const PRIORITIES = ["low", "medium", "high", "critical"];

export default function Tasks() {
  const { t } = useT();
  const {
    tasks,
    tasksStatus,
    loadTasks,
    todayCount,
    dailyLimit,
    addTask,
    updateTask,
    removeTask,
    toggleToday,
  } = useApp();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await addTask({ title: title.trim(), priority, est: 30, due });
    if (ok) {
      setTitle("");
      setDue("");
    }
  };

  const list = tasks.filter(
    (task) => filter === "all" || task.status === filter,
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("nav.tasks")}</h1>
        <p className="text-sm text-muted">
          {t("tasks.subtitle", { count: todayCount, limit: dailyLimit })}
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label={t("tasks.titleLabel")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("tasks.placeholder")}
          className={`${fieldCls} min-w-0 flex-1`}
        />
        <select
          aria-label={t("tasks.priorityLabel")}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className={fieldCls}
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {t(`priority.${p}`)}
            </option>
          ))}
        </select>
        <input
          aria-label={t("tasks.dueLabel")}
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className={fieldCls}
        />
        <button className={btnCls}>
          <Plus size={16} aria-hidden="true" />
          {t("tasks.addTask")}
        </button>
      </form>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t("tasks.filterLabel")}
      >
        {["all", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            className={`rounded-full border px-3 py-1 text-sm ${
              filter === s
                ? "border-accent bg-accent/10 text-accent"
                : "border-line text-muted"
            }`}
          >
            {s === "all" ? t("common.all") : t(`status.${s}`)}
          </button>
        ))}
      </div>

      {tasksStatus === "loading" && (
        <div aria-busy="true" className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-line/60" />
          ))}
        </div>
      )}

      {tasksStatus === "error" && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-medium">{t("common.somethingWrong")}</p>
          <p className="mt-1 text-sm text-muted">{t("tasks.loadError")}</p>
          <button onClick={loadTasks} className={`${btnCls} mt-4`}>
            {t("common.tryAgain")}
          </button>
        </div>
      )}

      {tasksStatus === "ready" &&
        (list.length === 0 ? (
          <Empty title={t("tasks.empty")} text={t("tasks.emptyText")} />
        ) : (
          <Card className="divide-y divide-line !p-0">
            {list.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <input
                  type="checkbox"
                  aria-label={t("tasks.complete", { title: task.title })}
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
                  className={`min-w-0 flex-1 ${task.status === "completed" ? "text-muted line-through" : ""}`}
                >
                  {task.title}
                </span>
                {task.due && (
                  <Badge>{t("tasks.due", { date: task.due })}</Badge>
                )}
                <Badge>{t(`priority.${task.priority}`)}</Badge>
                <select
                  aria-label={t("tasks.statusOf", { title: task.title })}
                  value={task.status}
                  onChange={(e) =>
                    updateTask(task.id, { status: e.target.value })
                  }
                  className={`${fieldCls} !py-1`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {t(`status.${s}`)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => toggleToday(task.id)}
                  aria-pressed={task.today}
                  aria-label={
                    task.today ? t("tasks.removeToday") : t("tasks.addToday")
                  }
                  className={task.today ? "text-accent" : "text-muted"}
                >
                  <Star size={18} fill={task.today ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => removeTask(task.id)}
                  aria-label={t("common.deleteItem", { title: task.title })}
                  className="text-muted hover:text-ink"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </Card>
        ))}
    </div>
  );
}
