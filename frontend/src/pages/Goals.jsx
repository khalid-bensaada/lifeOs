import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp, goalProgress } from "../context/AppContext";
import { Card, Bar, Empty, Badge, fieldCls, btnCls } from "../components/ui";

const CATEGORIES = [
  "Career",
  "Programming",
  "Design",
  "3D",
  "Video",
  "Fitness",
  "Finance",
  "Personal",
  "Education",
  "Other",
];

function GoalCard({ g }) {
  const { removeGoal, addMilestone, toggleMilestone } = useApp();
  const [ms, setMs] = useState("");
  const p = goalProgress(g);

  const submit = (e) => {
    e.preventDefault();
    if (!ms.trim()) return;
    addMilestone(g.id, ms.trim());
    setMs("");
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{g.title}</h2>
          <p className="mt-1 flex gap-2">
            <Badge>{g.category}</Badge>
            <Badge>Due {g.deadline || "no date"}</Badge>
          </p>
        </div>
        <button
          onClick={() => removeGoal(g.id)}
          aria-label={`Delete ${g.title}`}
          className="text-muted hover:text-ink"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Bar value={p} label={`${g.title} progress`} />
        <span className="text-sm text-muted">{p}%</span>
      </div>

      <ul className="space-y-1">
        {g.milestones.map((m) => (
          <li key={m.id}>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={m.done}
                onChange={() => toggleMilestone(g.id, m.id)}
                className="size-4 accent-[var(--accent)]"
              />
              <span className={m.done ? "text-muted line-through" : ""}>
                {m.title}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="flex gap-2">
        <input
          aria-label="New milestone"
          value={ms}
          onChange={(e) => setMs(e.target.value)}
          placeholder="Add a milestone"
          className={`${fieldCls} min-w-0 flex-1`}
        />
        <button className={btnCls}>Add</button>
      </form>
    </Card>
  );
}

export default function Goals() {
  const { goals, addGoal } = useApp();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");
  const [deadline, setDeadline] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({ title: title.trim(), category, deadline });
    setTitle("");
    setDeadline("");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Goals</h1>
        <p className="text-sm text-muted">
          Progress is calculated from completed milestones.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label="Goal title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to achieve?"
          className={`${fieldCls} min-w-0 flex-1`}
        />
        <select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={fieldCls}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
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
          Add goal
        </button>
      </form>

      {goals.length === 0 ? (
        <Empty
          title="No goals yet"
          text="What do you want to achieve? Create your first goal above."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {goals.map((g) => (
            <GoalCard key={g.id} g={g} />
          ))}
        </div>
      )}
    </div>
  );
}
