import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Bar, Badge, Empty, fieldCls, btnCls } from "../components/ui";
import {
  LEVEL_NAMES,
  skillProgress,
  levelComplete,
  currentLevel,
} from "../utils/skills";

const CATEGORIES = [
  "Programming",
  "Design",
  "Video Editing",
  "3D",
  "Languages",
  "Business",
  "Other",
];

function AddLine({ label, placeholder, onAdd }) {
  const [text, setText] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const ok = await onAdd(text.trim());
    if (ok) setText("");
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        aria-label={label}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className={`${fieldCls} min-w-0 flex-1 !py-1.5`}
      />
      <button className={btnCls} aria-label={`Add: ${label}`}>
        <Plus size={16} aria-hidden="true" />
      </button>
    </form>
  );
}

function SkillCard({ k }) {
  const {
    removeSkill,
    addSkillMilestone,
    toggleSkillMilestone,
    addPractice,
    togglePractice,
  } = useApp();
  const p = skillProgress(k);
  const cur = currentLevel(k);
  const practiceDone = k.projects.filter((x) => x.done).length;

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">{k.name}</h2>
          <p className="flex flex-wrap gap-2">
            <Badge>{k.category}</Badge>
            <Badge>
              {cur.mastered
                ? "All levels complete"
                : `Level ${cur.index + 1} · ${LEVEL_NAMES[cur.index]}`}
            </Badge>
          </p>
        </div>
        <button
          onClick={() => removeSkill(k.id)}
          aria-label={`Delete ${k.name}`}
          className="text-muted hover:text-ink"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Bar value={p} label={`${k.name} progress`} />
        <span className="text-sm text-muted">{p}%</span>
      </div>

      <div className="space-y-2">
        {k.levels.map((l, i) => (
          <details
            key={i}
            open={!cur.mastered && i === cur.index}
            className="rounded-lg border border-line px-3 py-2"
          >
            <summary className="cursor-pointer text-sm font-medium">
              Level {i + 1} · {LEVEL_NAMES[i]}{" "}
              <span className="font-normal text-muted">
                ({l.milestones.filter((m) => m.done).length}/
                {l.milestones.length}
                {levelComplete(l) ? " · Complete" : ""})
              </span>
            </summary>
            <ul className="mt-2 space-y-1">
              {l.milestones.map((m) => (
                <li key={m.id}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={m.done}
                      onChange={() => toggleSkillMilestone(k.id, i, m.id)}
                      className="size-4 accent-[var(--accent)]"
                    />
                    <span className={m.done ? "text-muted line-through" : ""}>
                      {m.title}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <AddLine
                label={`New milestone for ${k.name} level ${i + 1}`}
                placeholder="Add a milestone"
                onAdd={(t) => addSkillMilestone(k.id, i, t)}
              />
            </div>
          </details>
        ))}
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <h3 className="flex justify-between text-sm font-semibold">
          Learning path
          <span className="font-normal text-muted">
            {practiceDone} / {k.projects.length} projects
          </span>
        </h3>
        {k.projects.length === 0 && (
          <p className="text-xs text-muted">
            Add practical projects that make you use this skill.
          </p>
        )}
        <ol className="space-y-1">
          {k.projects.map((x, i) => (
            <li key={x.id}>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={x.done}
                  onChange={() => togglePractice(k.id, x.id)}
                  className="size-4 accent-[var(--accent)]"
                />
                <span className={x.done ? "text-muted line-through" : ""}>
                  {i + 1}. {x.title}
                </span>
              </label>
            </li>
          ))}
        </ol>
        <AddLine
          label={`New practice project for ${k.name}`}
          placeholder="Add a practice project"
          onAdd={(t) => addPractice(k.id, t)}
        />
      </div>
    </Card>
  );
}

export default function Skills() {
  const { skills, skillsStatus, loadSkills, addSkill } = useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Programming");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await addSkill({ name: name.trim(), category });
    if (ok) setName("");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Skills</h1>
        <p className="text-sm text-muted">
          Your level comes from the milestones you complete. You cannot type a
          percentage.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label="Skill name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Which skill do you want to learn?"
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
          Add skill
        </button>
      </form>

      {skillsStatus === "loading" && (
        <div aria-busy="true" className="grid gap-5 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-xl bg-line/60" />
          ))}
        </div>
      )}

      {skillsStatus === "error" && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-medium">Something went wrong.</p>
          <p className="mt-1 text-sm text-muted">
            We couldn&apos;t load your skills.
          </p>
          <button onClick={loadSkills} className={`${btnCls} mt-4`}>
            Try again
          </button>
        </div>
      )}

      {skillsStatus === "ready" &&
        (skills.length === 0 ? (
          <Empty
            title="No skills yet"
            text="Add a skill, then break each level into milestones."
          />
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-2">
            {skills.map((k) => (
              <SkillCard key={k.id} k={k} />
            ))}
          </div>
        ))}
    </div>
  );
}
