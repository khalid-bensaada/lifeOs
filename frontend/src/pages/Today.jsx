import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Check, X, Play } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n/useT";
import { Card, Empty, Badge, fieldCls, btnCls } from "../components/ui";
import { todayISO, addDays, fromISO } from "../utils/dates";
import { focusSeconds, fmt } from "../utils/time";

const Retry = ({ text, onRetry }) => {
  const { t } = useT();
  return (
    <div className="rounded-xl border border-dashed border-line p-8 text-center">
      <p className="font-medium">{t("common.somethingWrong")}</p>
      <p className="mt-1 text-sm text-muted">{text}</p>
      <button onClick={onRetry} className={`${btnCls} mt-4`}>
        {t("common.tryAgain")}
      </button>
    </div>
  );
};

const Skeleton = ({ height = "h-40" }) => (
  <div
    aria-busy="true"
    className={`${height} animate-pulse rounded-xl bg-line/60`}
  />
);

function Priorities() {
  const { t } = useT();
  const {
    tasks,
    tasksStatus,
    loadTasks,
    dailyReviews,
    todayCount,
    dailyLimit,
    addTask,
    updateTask,
    toggleToday,
  } = useApp();
  const [title, setTitle] = useState("");

  const planned = tasks.filter((task) => task.today);
  const open = tasks
    .filter(
      (task) => !task.today && !["completed", "skipped"].includes(task.status),
    )
    .slice(0, 8);
  const full = todayCount >= dailyLimit;

  const yesterday = dailyReviews.find(
    (r) => r.date === addDays(todayISO(), -1),
  );
  const hint = yesterday?.tomorrowFirst;
  const hintTaken =
    !hint || tasks.some((task) => task.title === hint && task.today);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || full) return;
    if (
      await addTask({
        title: title.trim(),
        priority: "high",
        est: 30,
        today: true,
      })
    )
      setTitle("");
  };

  const addHint = () =>
    addTask({ title: hint, priority: "high", est: 30, today: true });

  return (
    <Card className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold">{t("today.priorities")}</h2>
        <span className="text-sm text-muted" dir="ltr">
          {todayCount} / {dailyLimit}
        </span>
      </div>

      {tasksStatus === "loading" && <Skeleton height="h-32" />}
      {tasksStatus === "error" && (
        <Retry text={t("tasks.loadError")} onRetry={loadTasks} />
      )}

      {tasksStatus === "ready" && (
        <>
          {!hintTaken && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm">
              <span>
                <span className="text-muted">{t("today.hint")} </span>
                {hint}
              </span>
              <button
                onClick={addHint}
                disabled={full}
                className="text-accent hover:underline disabled:opacity-50"
              >
                {t("today.addToToday")}
              </button>
            </div>
          )}

          {planned.length === 0 ? (
            <Empty title={t("today.emptyTitle")} text={t("today.emptyText")} />
          ) : (
            <ul className="space-y-1">
              {planned.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-line/40"
                >
                  <input
                    type="checkbox"
                    aria-label={t("tasks.complete", { title: task.title })}
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
                    className={`min-w-0 flex-1 ${task.status === "completed" ? "text-muted line-through" : ""}`}
                  >
                    {task.title}
                  </span>
                  {task.status !== "completed" && (
                    <Link
                      to={`/focus?task=${task.id}`}
                      aria-label={t("today.focusOn", { title: task.title })}
                      className="text-muted hover:text-accent"
                    >
                      <Play size={16} />
                    </Link>
                  )}
                  <Badge>{t("common.minutes", { n: task.est })}</Badge>
                  <button
                    onClick={() => toggleToday(task.id)}
                    aria-label={t("today.removeFrom", { title: task.title })}
                    className="text-muted hover:text-ink"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={submit} className="flex gap-2">
            <input
              aria-label={t("today.newPriority")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={full}
              placeholder={full ? t("today.full") : t("today.addPlaceholder")}
              className={`${fieldCls} min-w-0 flex-1 disabled:opacity-60`}
            />
            <button disabled={full} className={`${btnCls} disabled:opacity-60`}>
              <Plus size={16} aria-hidden="true" />
              {t("common.add")}
            </button>
          </form>

          {open.length > 0 && !full && (
            <div className="space-y-2">
              <p className="text-sm text-muted">{t("today.pickOpen")}</p>
              <div
                className="flex flex-wrap gap-2"
                role="group"
                aria-label={t("today.openTasks")}
              >
                {open.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleToday(task.id)}
                    className="rounded-full border border-line px-3 py-1 text-sm text-muted hover:border-accent hover:text-accent"
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function Schedule() {
  const { t } = useT();
  const {
    events,
    eventsStatus,
    loadEvents,
    addEvent,
    updateEvent,
    removeEvent,
  } = useApp();
  const date = todayISO();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [edit, setEdit] = useState(null);

  const list = events
    .filter((e) => e.date === date)
    .sort((a, b) => (a.start || "99:99").localeCompare(b.start || "99:99"));

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (await addEvent({ title: title.trim(), date, start, end })) {
      setTitle("");
      setStart("");
      setEnd("");
    }
  };

  const saveEdit = async () => {
    if (!edit.title.trim()) return;
    if (
      await updateEvent(edit.id, {
        title: edit.title.trim(),
        start: edit.start,
        end: edit.end,
      })
    )
      setEdit(null);
  };

  const setField = (key) => (e) =>
    setEdit((s) => ({ ...s, [key]: e.target.value }));

  return (
    <Card className="space-y-4">
      <h2 className="font-semibold">{t("today.schedule")}</h2>

      {eventsStatus === "loading" && <Skeleton height="h-32" />}
      {eventsStatus === "error" && (
        <Retry text={t("today.scheduleError")} onRetry={loadEvents} />
      )}

      {eventsStatus === "ready" && (
        <>
          {list.length === 0 ? (
            <Empty
              title={t("today.nothingScheduled")}
              text={t("today.nothingScheduledText")}
            />
          ) : (
            <ul className="divide-y divide-line">
              {list.map((ev) =>
                edit?.id === ev.id ? (
                  <li
                    key={ev.id}
                    className="flex flex-wrap items-center gap-2 py-2"
                  >
                    <input
                      aria-label={t("today.eventTitle")}
                      value={edit.title}
                      onChange={setField("title")}
                      className={`${fieldCls} min-w-0 flex-1`}
                    />
                    <input
                      aria-label={t("today.startTime")}
                      type="time"
                      value={edit.start}
                      onChange={setField("start")}
                      className={fieldCls}
                    />
                    <input
                      aria-label={t("today.endTime")}
                      type="time"
                      value={edit.end}
                      onChange={setField("end")}
                      className={fieldCls}
                    />
                    <button
                      onClick={saveEdit}
                      aria-label={t("today.saveChanges")}
                      className="text-accent"
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
                  </li>
                ) : (
                  <li
                    key={ev.id}
                    className="flex items-center gap-3 py-2 text-sm"
                  >
                    <span className="w-28 shrink-0 text-muted" dir="ltr">
                      {ev.start
                        ? `${ev.start}${ev.end ? `–${ev.end}` : ""}`
                        : t("today.anyTime")}
                    </span>
                    <span className="min-w-0 flex-1">{ev.title}</span>
                    <button
                      onClick={() =>
                        setEdit({
                          id: ev.id,
                          title: ev.title,
                          start: ev.start,
                          end: ev.end,
                        })
                      }
                      aria-label={t("common.editItem", { title: ev.title })}
                      className="text-muted hover:text-ink"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => removeEvent(ev.id)}
                      aria-label={t("common.deleteItem", { title: ev.title })}
                      className="text-muted hover:text-ink"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ),
              )}
            </ul>
          )}

          <form
            onSubmit={submit}
            className="flex flex-wrap gap-2 border-t border-line pt-4"
          >
            <input
              aria-label={t("today.newBlock")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("today.blockPlaceholder")}
              className={`${fieldCls} min-w-0 flex-1`}
            />
            <input
              aria-label={t("today.startTime")}
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={fieldCls}
            />
            <input
              aria-label={t("today.endTime")}
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={fieldCls}
            />
            <button className={btnCls}>
              <Plus size={16} aria-hidden="true" />
              {t("common.add")}
            </button>
          </form>
        </>
      )}
    </Card>
  );
}

const Stat = ({ label, value }) => (
  <div>
    <p className="text-lg font-semibold" dir="ltr">
      {value}
    </p>
    <p className="text-xs text-muted">{label}</p>
  </div>
);

function DayReviewForm() {
  const { t } = useT();
  const { tasks, habits, entries, dailyReviews, saveDailyReview } = useApp();
  const date = todayISO();
  const existing = dailyReviews.find((r) => r.date === date);

  const [form, setForm] = useState({
    wentWell: existing?.wentWell || "",
    improve: existing?.improve || "",
    tomorrowFirst: existing?.tomorrowFirst || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const planned = tasks.filter((task) => task.today);
  const done = planned.filter((task) => task.status === "completed").length;
  const habitsDone = habits.filter((h) => h.logs.includes(date)).length;
  const focus = focusSeconds(entries, 0, 1);

  const set = (key) => (e) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await saveDailyReview(date, form);
    setSaving(false);
    setSaved(ok === true);
  };

  return (
    <Card className="space-y-5">
      <h2 className="font-semibold">{t("today.dayReview")}</h2>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat
          label={t("today.prioritiesDone")}
          value={`${done} / ${planned.length}`}
        />
        <Stat label={t("dashboard.focusTime")} value={fmt(focus)} />
        <Stat
          label={t("nav.habits")}
          value={`${habitsDone} / ${habits.length}`}
        />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{t("today.wentWell")}</span>
          <textarea
            rows={3}
            value={form.wentWell}
            onChange={set("wentWell")}
            className={`${fieldCls} w-full`}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{t("today.improve")}</span>
          <textarea
            rows={3}
            value={form.improve}
            onChange={set("improve")}
            className={`${fieldCls} w-full`}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">
            {t("today.tomorrowFirst")}
          </span>
          <input
            value={form.tomorrowFirst}
            onChange={set("tomorrowFirst")}
            className={`${fieldCls} w-full`}
          />
        </label>

        <div className="flex items-center gap-4">
          <button disabled={saving} className={`${btnCls} disabled:opacity-60`}>
            {saving
              ? t("common.saving")
              : existing
                ? t("common.updateReview")
                : t("common.saveReview")}
          </button>
          {saved && (
            <p role="status" className="text-sm text-accent">
              {t("today.reviewSaved")}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}

function DayReview() {
  const { t } = useT();
  const {
    tasksStatus,
    habitsStatus,
    entriesStatus,
    dailyStatus,
    loadTasks,
    loadHabits,
    loadEntries,
    loadDaily,
  } = useApp();
  const statuses = [tasksStatus, habitsStatus, entriesStatus, dailyStatus];

  if (statuses.includes("error")) {
    return (
      <Retry
        text={t("today.reviewError")}
        onRetry={() => {
          loadTasks();
          loadHabits();
          loadEntries();
          loadDaily();
        }}
      />
    );
  }
  if (statuses.includes("loading")) return <Skeleton height="h-72" />;
  return <DayReviewForm />;
}

export default function Today() {
  const { t, formatDate } = useT();
  const longDate = formatDate(fromISO(todayISO()), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("nav.today")}</h1>
        <p className="text-sm text-muted">
          {t("today.subtitle", { date: longDate })}
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Priorities />
        <Schedule />
      </div>

      <DayReview />
    </div>
  );
}
