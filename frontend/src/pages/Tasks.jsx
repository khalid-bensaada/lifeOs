import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Empty, Badge, fieldCls, btnCls } from "../components/ui";

const STATUS = {
  todo: "Todo",
  in_progress: "In progress",
  completed: "Completed",
  skipped: "Skipped",
};

const PRIORITY = ["low", "medium", "high", "critical"];

export default function Tasks() {
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

  const list = tasks.filter((t) => filter === "all" || t.status === filter);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <p className="text-sm text-muted">
          {todayCount} / {dailyLimit} marked as today&apos;s priorities.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className={`${fieldCls} min-w-0 flex-1`}
        />
        <select
          aria-label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className={fieldCls}
        >
          {PRIORITY.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          aria-label="Due date"
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className={fieldCls}
        />
        <button className={btnCls}>
          <Plus size={16} aria-hidden="true" />
          Add task
        </button>
      </form>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by status"
      >
        {["all", ...Object.keys(STATUS)].map((s) => (
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
            {s === "all" ? "All" : STATUS[s]}
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
          <p className="font-medium">Something went wrong.</p>
          <p className="mt-1 text-sm text-muted">
            We couldn&apos;t load your tasks.
          </p>
          <button onClick={loadTasks} className={`${btnCls} mt-4`}>
            Try again
          </button>
        </div>
      )}

      {tasksStatus === "ready" &&
        (list.length === 0 ? (
          <Empty
            title="No tasks here"
            text="Add a task above to get started."
          />
        ) : (
          <Card className="divide-y divide-line !p-0">
            {list.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <input
                  type="checkbox"
                  aria-label={`Complete ${t.title}`}
                  checked={t.status === "completed"}
                  className="size-4 accent-[var(--accent)]"
                  onChange={() =>
                    updateTask(t.id, {
                      status: t.status === "completed" ? "todo" : "completed",
                    })
                  }
                />
                <span
                  className={`min-w-0 flex-1 ${t.status === "completed" ? "text-muted line-through" : ""}`}
                >
                  {t.title}
                </span>
                {t.due && <Badge>Due {t.due}</Badge>}
                <Badge>{t.priority}</Badge>
                <select
                  aria-label={`Status of ${t.title}`}
                  value={t.status}
                  onChange={(e) => updateTask(t.id, { status: e.target.value })}
                  className={`${fieldCls} !py-1`}
                >
                  {Object.entries(STATUS).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => toggleToday(t.id)}
                  aria-pressed={t.today}
                  aria-label={t.today ? "Remove from today" : "Add to today"}
                  className={t.today ? "text-accent" : "text-muted"}
                >
                  <Star size={18} fill={t.today ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={() => removeTask(t.id)}
                  aria-label={`Delete ${t.title}`}
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
