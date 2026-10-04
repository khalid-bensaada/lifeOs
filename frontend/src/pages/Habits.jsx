import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Empty, Badge, fieldCls, btnCls } from "../components/ui";
import { lastDays, dayName, todayISO } from "../utils/dates";
import { streaks, rate } from "../utils/habits";

const CATEGORIES = [
  "Programming",
  "Design",
  "3D",
  "Video",
  "Fitness",
  "Education",
  "Personal",
  "Other",
];

const Stat = ({ label, value }) => (
  <div>
    <p className="text-lg font-semibold">{value}</p>
    <p className="text-xs text-muted">{label}</p>
  </div>
);

function HabitCard({ h }) {
  const { toggleHabitLog, removeHabit } = useApp();
  const week = lastDays(7);
  const set = new Set(h.logs);
  const { current, best } = streaks(h.logs);
  const weekDone = week.filter((d) => set.has(d)).length;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-semibold">{h.name}</h2>
          <Badge>{h.category}</Badge>
        </div>
        <button
          onClick={() => removeHabit(h.id)}
          aria-label={`Delete ${h.name}`}
          className="text-muted hover:text-ink"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {week.map((d) => {
          const done = set.has(d);
          return (
            <div key={d} className="text-center">
              <span className="text-xs text-muted">{dayName(d)}</span>
              <button
                onClick={() => toggleHabitLog(h.id, d)}
                aria-pressed={done}
                aria-label={`${h.name} on ${d}`}
                className={`mt-1 h-9 w-full rounded-lg border ${
                  done
                    ? "border-accent bg-accent text-white"
                    : "border-line text-transparent hover:border-accent"
                } ${d === todayISO() ? "ring-2 ring-accent/30" : ""}`}
              >
                <Check size={16} className="mx-auto" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-2 border-t border-line pt-4 text-center">
        <Stat label="Current streak" value={`${current}d`} />
        <Stat label="Best streak" value={`${best}d`} />
        <Stat label="This week" value={`${weekDone}/7`} />
        <Stat label="Last 30 days" value={`${rate(h.logs, 30)}%`} />
      </div>
    </Card>
  );
}

export default function Habits() {
  const { habits, addHabit } = useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Programming");

  const today = todayISO();
  const doneToday = habits.filter((h) => h.logs.includes(today)).length;

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit({ name: name.trim(), category });
    setName("");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Habits</h1>
        <p className="text-sm text-muted">
          {doneToday} / {habits.length} completed today. Missing one day does
          not break your streak.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label="Habit name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Which habit do you want to build?"
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
        <button className={btnCls}>
          <Plus size={16} aria-hidden="true" />
          Add habit
        </button>
      </form>

      {habits.length === 0 ? (
        <Empty
          title="No habits yet"
          text="Start with one small habit you can repeat every day."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {habits.map((h) => (
            <HabitCard key={h.id} h={h} />
          ))}
        </div>
      )}
    </div>
  );
}
