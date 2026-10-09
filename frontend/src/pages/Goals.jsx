import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp, goalProgress } from "../context/AppContext";
import { useT } from "../i18n/useT";
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

function useAction() {
  const [error, setError] = useState("");
  const run = async (fn) => {
    setError("");
    try {
      await fn();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };
  return [error, run];
}

function GoalCard({ g }) {
  const { t, tc } = useT();
  const { removeGoal, addMilestone, toggleMilestone } = useApp();
  const [ms, setMs] = useState("");
  const [error, run] = useAction();
  const p = goalProgress(g);

  const submit = async (e) => {
    e.preventDefault();
    if (!ms.trim()) return;
    if (await run(() => addMilestone(g.id, ms.trim()))) setMs("");
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{g.title}</h2>
          <p className="mt-1 flex flex-wrap gap-2">
            <Badge>{tc(g.category)}</Badge>
            <Badge>
              {t("goals.due", { date: g.deadline || t("goals.noDate") })}
            </Badge>
          </p>
        </div>
        <button
          onClick={() => run(() => removeGoal(g.id))}
          aria-label={t("common.deleteItem", { title: g.title })}
          className="text-muted hover:text-ink"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Bar value={p} label={t("common.progressOf", { title: g.title })} />
        <span className="text-sm text-muted" dir="ltr">
          {p}%
        </span>
      </div>

      <ul className="space-y-1">
        {g.milestones.map((m) => (
          <li key={m.id}>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={m.done}
                onChange={() => run(() => toggleMilestone(g.id, m.id))}
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
          aria-label={t("goals.newMilestone")}
          value={ms}
          onChange={(e) => setMs(e.target.value)}
          placeholder={t("goals.milestonePlaceholder")}
          className={`${fieldCls} min-w-0 flex-1`}
        />
        <button className={btnCls}>{t("common.add")}</button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}
    </Card>
  );
}

export default function Goals() {
  const { t, tc } = useT();
  const { goals, goalsStatus, loadGoals, addGoal } = useApp();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Programming");
  const [deadline, setDeadline] = useState("");
  const [error, run] = useAction();

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await run(() =>
      addGoal({ title: title.trim(), category, deadline }),
    );
    if (ok) {
      setTitle("");
      setDeadline("");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("nav.goals")}</h1>
        <p className="text-sm text-muted">{t("goals.subtitle")}</p>
      </header>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label={t("goals.titleLabel")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("goals.placeholder")}
          className={`${fieldCls} min-w-0 flex-1`}
        />
        <select
          aria-label={t("common.category")}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={fieldCls}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {tc(c)}
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
          {t("goals.addGoal")}
        </button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}

      {goalsStatus === "loading" && (
        <div aria-busy="true" className="grid gap-5 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-line/60" />
          ))}
        </div>
      )}

      {goalsStatus === "error" && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-medium">{t("common.somethingWrong")}</p>
          <p className="mt-1 text-sm text-muted">{t("goals.loadError")}</p>
          <button onClick={loadGoals} className={`${btnCls} mt-4`}>
            {t("common.tryAgain")}
          </button>
        </div>
      )}

      {goalsStatus === "ready" &&
        (goals.length === 0 ? (
          <Empty title={t("goals.empty")} text={t("goals.emptyText")} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {goals.map((g) => (
              <GoalCard key={g.id} g={g} />
            ))}
          </div>
        ))}
    </div>
  );
}
