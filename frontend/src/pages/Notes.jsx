import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n/useT";
import { Card, Badge, Empty, fieldCls, btnCls } from "../components/ui";
import { addDays, fromISO } from "../utils/dates";
import * as notesApi from "../services/notes";

const TYPE_ROUTES = {
  goal: "/goals",
  project: "/projects",
  skill: "/skills",
  task: "/tasks",
  review: "/review",
};

const FILTERS = [
  ["all", "common.all"],
  ["none", "notes.unattached"],
  ["goal", "nav.goals"],
  ["project", "nav.projects"],
  ["skill", "nav.skills"],
  ["task", "nav.tasks"],
  ["review", "notes.filter.review"],
];

const asAttachment = (type, target) =>
  type && target ? { type, id: Number(target) } : null;

function useOptions() {
  const { t, formatDate } = useT();
  const { goals, projects, skills, tasks, reviews } = useApp();

  const weekLabel = (weekStart) => {
    const f = (iso) =>
      formatDate(fromISO(iso), { day: "numeric", month: "short" });
    return t("calendar.weekOf", {
      date: `${f(weekStart)} – ${f(addDays(weekStart, 6))}`,
    });
  };

  return {
    goal: goals.map((g) => [g.id, g.title]),
    project: projects.map((p) => [p.id, p.title]),
    skill: skills.map((k) => [k.id, k.name]),
    task: tasks.map((task) => [task.id, task.title]),
    review: reviews.map((r) => [r.id, weekLabel(r.weekStart)]),
  };
}

function AttachPicker({ type, target, onType, onTarget }) {
  const { t } = useT();
  const options = useOptions();
  const list = type ? options[type] : [];

  return (
    <>
      <select
        aria-label={t("notes.attachTo")}
        value={type}
        onChange={(e) => {
          onType(e.target.value);
          onTarget("");
        }}
        className={fieldCls}
      >
        <option value="">{t("notes.noAttachment")}</option>
        {Object.keys(TYPE_ROUTES).map((key) => (
          <option key={key} value={key}>
            {t(`notes.type.${key}`)}
          </option>
        ))}
      </select>

      {type && (
        <select
          aria-label={t("notes.item")}
          value={target}
          onChange={(e) => onTarget(e.target.value)}
          className={`${fieldCls} min-w-0 max-w-full`}
        >
          <option value="">
            {list.length ? t("notes.chooseItem") : t("notes.noItems")}
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
  const { t } = useT();
  const options = useOptions();
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);

  const attachment = note.attachment;
  const label = attachment
    ? options[attachment.type].find(([id]) => id === attachment.id)?.[1] ||
      t(`notes.type.${attachment.type}`)
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
          aria-label={t("notes.editNote")}
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
            aria-label={t("notes.saveNote")}
            className="ms-auto text-accent disabled:opacity-60"
          >
            <Check size={18} />
          </button>
          <button
            onClick={() => setEdit(null)}
            aria-label={t("common.cancel")}
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
          <Link to={TYPE_ROUTES[attachment.type]} className="hover:text-accent">
            <Badge>
              {t("notes.attachedBadge", {
                type: t(`notes.type.${attachment.type}`),
                label,
              })}
            </Badge>
          </Link>
        ) : (
          <Badge>{t("notes.unattached")}</Badge>
        )}
        <span dir="ltr">{note.createdAt.slice(0, 10)}</span>
        <button
          onClick={startEdit}
          aria-label={t("notes.editNote")}
          className="ms-auto hover:text-ink"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => onDelete(note.id)}
          aria-label={t("notes.deleteNote")}
          className="hover:text-ink"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Card>
  );
}

export default function Notes() {
  const { t } = useT();
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
      setError(t("notes.chooseError"));
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
      setError(t("notes.chooseError"));
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
        <h1 className="text-2xl font-semibold">{t("nav.notes")}</h1>
        <p className="text-sm text-muted">{t("notes.subtitle")}</p>
      </header>

      <Card>
        <form onSubmit={submit} className="space-y-3">
          <textarea
            aria-label={t("notes.newNote")}
            rows={3}
            maxLength={5000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("notes.writePlaceholder")}
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
              {saving ? t("common.saving") : t("notes.addNote")}
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
        aria-label={t("notes.filterLabel")}
      >
        {FILTERS.map(([key, labelKey]) => (
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
            {t(labelKey)}
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
          <p className="font-medium">{t("common.somethingWrong")}</p>
          <p className="mt-1 text-sm text-muted">{t("notes.loadError")}</p>
          <button onClick={load} className={`${btnCls} mt-4`}>
            {t("common.tryAgain")}
          </button>
        </div>
      )}

      {status === "ready" &&
        (visible.length === 0 ? (
          <Empty
            title={notes.length === 0 ? t("notes.empty") : t("notes.noneHere")}
            text={
              notes.length === 0
                ? t("notes.emptyText")
                : t("notes.noneHereText")
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
