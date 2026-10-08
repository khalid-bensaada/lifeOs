import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Card, Badge, Empty, fieldCls, btnCls } from "../components/ui";
import { addDays, fromISO } from "../utils/dates";
import * as notesApi from "../services/notes";

const TYPES = {
  goal: { label: "Goal", plural: "goals", to: "/goals" },
  project: { label: "Project", plural: "projects", to: "/projects" },
  skill: { label: "Skill", plural: "skills", to: "/skills" },
  task: { label: "Task", plural: "tasks", to: "/tasks" },
  review: { label: "Weekly review", plural: "weekly reviews", to: "/review" },
};

const FILTERS = [
  ["all", "All"],
  ["none", "Unattached"],
  ["goal", "Goals"],
  ["project", "Projects"],
  ["skill", "Skills"],
  ["task", "Tasks"],
  ["review", "Reviews"],
];

const weekLabel = (weekStart) => {
  const f = (iso) =>
    fromISO(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  return `Week of ${f(weekStart)} – ${f(addDays(weekStart, 6))}`;
};

const asAttachment = (type, target) =>
  type && target ? { type, id: Number(target) } : null;

function useOptions() {
  const { goals, projects, skills, tasks, reviews } = useApp();
  return {
    goal: goals.map((g) => [g.id, g.title]),
    project: projects.map((p) => [p.id, p.title]),
    skill: skills.map((k) => [k.id, k.name]),
    task: tasks.map((t) => [t.id, t.title]),
    review: reviews.map((r) => [r.id, weekLabel(r.weekStart)]),
  };
}

function AttachPicker({ type, target, onType, onTarget }) {
  const options = useOptions();
  const list = type ? options[type] : [];

  return (
    <>
      <select
        aria-label="Attach to"
        value={type}
        onChange={(e) => {
          onType(e.target.value);
          onTarget("");
        }}
        className={fieldCls}
      >
        <option value="">No attachment</option>
        {Object.entries(TYPES).map(([key, t]) => (
          <option key={key} value={key}>
            {t.label}
          </option>
        ))}
      </select>

      {type && (
        <select
          aria-label="Item"
          value={target}
          onChange={(e) => onTarget(e.target.value)}
          className={`${fieldCls} min-w-0 max-w-full`}
        >
          <option value="">
            {list.length
              ? `Choose a ${TYPES[type].label.toLowerCase()}`
              : `No ${TYPES[type].plural} yet`}
          </option>
          {list.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      )}
    </>
  );
}

function NoteCard({ note, onSave, onDelete }) {
  const options = useOptions();
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const attachment = note.attachment;
  const label = attachment
    ? options[attachment.type].find(([id]) => id === attachment.id)?.[1] ||
      TYPES[attachment.type].label
    : null;

  const startEdit = () =>
    setEdit({
      body: note.body,
      type: attachment ? attachment.type : "",
      target: attachment ? String(attachment.id) : "",
    });

  const save = async () => {
    if (!edit.body.trim()) return;
    setSaving(true);
    const ok = await onSave(
      note.id,
      {
        body: edit.body.trim(),
        attachment: asAttachment(edit.type, edit.target),
      },
      edit,
    );
    setSaving(false);
    if (ok) setEdit(null);
  };

  if (edit) {
    return (
      <Card className="space-y-3 !p-4">
        <textarea
          aria-label="Edit note"
          rows={4}
          value={edit.body}
          onChange={(e) => setEdit((s) => ({ ...s, body: e.target.value }))}
          className={`${fieldCls} w-full`}
        />
        <div className="flex flex-wrap items-center gap-2">
          <AttachPicker
            type={edit.type}
            target={edit.target}
            onType={(type) => setEdit((s) => ({ ...s, type }))}
            onTarget={(target) => setEdit((s) => ({ ...s, target }))}
          />
          <button
            onClick={save}
            disabled={saving}
            aria-label="Save note"
            className="ms-auto text-accent disabled:opacity-60"
          >
            <Check size={18} />
          </button>
          <button
            onClick={() => setEdit(null)}
            aria-label="Cancel"
            className="text-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-3 !p-4">
      <p className="whitespace-pre-wrap text-sm">{note.body}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        {attachment ? (
          <Link to={TYPES[attachment.type].to} className="hover:text-accent">
            <Badge>
              {TYPES[attachment.type].label}: {label}
            </Badge>
          </Link>
        ) : (
          <Badge>Unattached</Badge>
        )}
        <span>{note.createdAt.slice(0, 10)}</span>
        <button
          onClick={startEdit}
          aria-label="Edit note"
          className="ms-auto hover:text-ink"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(note.id)}
          aria-label="Delete note"
          className="hover:text-ink"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  );
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("");
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setNotes(await notesApi.list());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    if (type && !target) {
      setError("Choose the item to attach to, or select No attachment.");
      return;
    }
    setSaving(true);
    const ok = await run(async () => {
      const saved = await notesApi.create({
        body: body.trim(),
        attachment: asAttachment(type, target),
      });
      setNotes((s) => [saved, ...s]);
    });
    setSaving(false);
    if (ok) {
      setBody("");
      setType("");
      setTarget("");
    }
  };

  const save = (id, patch, edit) => {
    if (edit.type && !edit.target) {
      setError("Choose the item to attach to, or select No attachment.");
      return false;
    }
    return run(async () => {
      const saved = await notesApi.update(id, patch);
      setNotes((s) => s.map((n) => (n.id === id ? saved : n)));
    });
  };

  const remove = (id) =>
    run(async () => {
      await notesApi.remove(id);
      setNotes((s) => s.filter((n) => n.id !== id));
    });

  const visible = notes.filter((n) => {
    if (filter === "all") return true;
    if (filter === "none") return !n.attachment;
    return n.attachment?.type === filter;
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Notes</h1>
        <p className="text-sm text-muted">
          Short notes, kept next to the things they belong to.
        </p>
      </header>

      <Card>
        <form onSubmit={submit} className="space-y-3">
          <textarea
            aria-label="New note"
            rows={3}
            maxLength={5000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a note"
            className={`${fieldCls} w-full`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <AttachPicker
              type={type}
              target={target}
              onType={setType}
              onTarget={setTarget}
            />
            <button
              disabled={saving}
              className={`${btnCls} ms-auto disabled:opacity-60`}
            >
              <Plus size={16} aria-hidden="true" />
              {saving ? "Saving..." : "Add note"}
            </button>
          </div>
        </form>
      </Card>

      {error && (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      )}

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter notes"
      >
        {FILTERS.map(([key, text]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`rounded-full border px-3 py-1 text-sm ${
              filter === key
                ? "border-accent bg-accent/10 text-accent"
                : "border-line text-muted"
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      {status === "loading" && (
        <div aria-busy="true" className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-line/60" />
          ))}
        </div>
      )}

      {status === "error" && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-medium">Something went wrong.</p>
          <p className="mt-1 text-sm text-muted">
            We couldn&apos;t load your notes.
          </p>
          <button onClick={load} className={`${btnCls} mt-4`}>
            Try again
          </button>
        </div>
      )}

      {status === "ready" &&
        (visible.length === 0 ? (
          <Empty
            title={notes.length === 0 ? "No notes yet" : "No notes here"}
            text={
              notes.length === 0
                ? "Write your first note above."
                : "Try another filter."
            }
          />
        ) : (
          <div className="space-y-3">
            {visible.map((n) => (
              <NoteCard key={n.id} note={n} onSave={save} onDelete={remove} />
            ))}
          </div>
        ))}
    </div>
  );
}
