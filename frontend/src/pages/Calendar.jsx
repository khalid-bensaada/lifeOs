import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n/useT";
import { Card, Empty, fieldCls, btnCls } from "../components/ui";
import {
  todayISO,
  fromISO,
  addDays,
  addMonths,
  startOfWeek,
  monthGrid,
} from "../utils/dates";

const KIND = {
  event: {
    key: "calendar.kind.event",
    dot: "bg-violet-500",
    bar: "border-violet-500",
  },
  task: {
    key: "calendar.kind.task",
    dot: "bg-blue-500",
    bar: "border-blue-500",
  },
  goal: {
    key: "calendar.kind.goal",
    dot: "bg-amber-500",
    bar: "border-amber-500",
  },
  habit: {
    key: "calendar.kind.habit",
    dot: "bg-emerald-500",
    bar: "border-emerald-500",
  },
};

const VIEWS = ["month", "week", "day"];
const MONDAY = "2024-01-01";

export default function Calendar() {
  const { t, formatDate, shortDay } = useT();
  const {
    tasks,
    goals,
    habits,
    events,
    eventsStatus,
    loadEvents,
    addEvent,
    removeEvent,
  } = useApp();
  const today = todayISO();
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(today);
  const [selected, setSelected] = useState(today);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const longDate = (iso) =>
    formatDate(fromISO(iso), {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    shortDay(addDays(MONDAY, i)),
  );

  const itemsFor = (iso) => [
    ...events
      .filter((e) => e.date === iso)
      .sort((a, b) => (a.start || "").localeCompare(b.start || ""))
      .map((e) => ({
        id: e.id,
        kind: "event",
        label: e.title,
        time: e.start ? `${e.start}${e.end ? `–${e.end}` : ""}` : "",
      })),
    ...tasks
      .filter((task) => task.due === iso || (task.today && iso === today))
      .map((task) => ({
        id: task.id,
        kind: "task",
        label: task.title,
        done: task.status === "completed",
      })),
    ...goals
      .filter((g) => g.deadline === iso)
      .map((g) => ({ id: g.id, kind: "goal", label: g.title })),
    ...habits
      .filter((h) => h.logs.includes(iso))
      .map((h) => ({ id: h.id, kind: "habit", label: h.name })),
  ];

  const move = (n) => {
    const next =
      view === "month"
        ? addMonths(cursor, n)
        : addDays(cursor, view === "week" ? 7 * n : n);
    setCursor(next);
    if (view === "day") setSelected(next);
  };

  const changeView = (v) => {
    setView(v);
    setCursor(selected);
  };

  const goToday = () => {
    setCursor(today);
    setSelected(today);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const ok = await addEvent({
      title: title.trim(),
      date: selected,
      start,
      end,
    });
    if (ok) {
      setTitle("");
      setStart("");
      setEnd("");
    }
  };

  const label =
    view === "month"
      ? formatDate(fromISO(cursor), { month: "long", year: "numeric" })
      : view === "week"
        ? t("calendar.weekOf", {
            date: formatDate(fromISO(startOfWeek(cursor)), {
              day: "numeric",
              month: "short",
            }),
          })
        : longDate(selected);

  const cells = monthGrid(cursor);
  const month = fromISO(cursor).getMonth();
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(startOfWeek(cursor), i),
  );
  const dayItems = itemsFor(selected);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("nav.calendar")}</h1>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {Object.values(KIND).map((k) => (
            <span key={k.key} className="inline-flex items-center gap-1.5">
              <span
                className={`size-2 rounded-full ${k.dot}`}
                aria-hidden="true"
              />
              {t(k.key)}
            </span>
          ))}
        </p>
      </header>

      {eventsStatus === "error" && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-3 text-sm"
        >
          <span>{t("calendar.loadError")}</span>
          <button onClick={loadEvents} className="text-accent hover:underline">
            {t("common.tryAgain")}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => move(-1)}
            aria-label={t("calendar.previous")}
            className="rounded-lg border border-line p-2"
          >
            <ChevronLeft size={16} className="rtl:rotate-180" />
          </button>
          <button
            onClick={() => move(1)}
            aria-label={t("calendar.next")}
            className="rounded-lg border border-line p-2"
          >
            <ChevronRight size={16} className="rtl:rotate-180" />
          </button>
          <button
            onClick={goToday}
            className="rounded-lg border border-line px-3 py-1.5 text-sm"
          >
            {t("calendar.todayBtn")}
          </button>
          <h2 className="ms-2 font-semibold">{label}</h2>
        </div>
        <div
          className="flex gap-2"
          role="group"
          aria-label={t("calendar.viewLabel")}
        >
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => changeView(v)}
              aria-pressed={view === v}
              className={`rounded-full border px-3 py-1 text-sm ${
                view === v
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-muted"
              }`}
            >
              {t(`calendar.view.${v}`)}
            </button>
          ))}
        </div>
      </div>

      {view === "month" && (
        <Card className="!p-2 sm:!p-3">
          <div className="grid grid-cols-7 text-center text-xs text-muted">
            {weekdays.map((d, i) => (
              <div key={i} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-line">
            {cells.map((iso) => {
              const items = itemsFor(iso);
              const inMonth = fromISO(iso).getMonth() === month;
              return (
                <button
                  key={iso}
                  onClick={() => setSelected(iso)}
                  aria-pressed={iso === selected}
                  aria-label={t("calendar.dayItems", {
                    date: longDate(iso),
                    count: items.length,
                  })}
                  className={`min-h-16 bg-card p-1.5 text-start sm:min-h-24 ${inMonth ? "" : "opacity-40"} ${
                    iso === selected ? "ring-2 ring-inset ring-accent" : ""
                  }`}
                >
                  <span
                    className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${
                      iso === today ? "bg-accent text-white" : ""
                    }`}
                  >
                    {fromISO(iso).getDate()}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                    {items.slice(0, 4).map((i) => (
                      <span
                        key={`${i.kind}-${i.id}`}
                        className={`size-1.5 rounded-full ${KIND[i.kind].dot}`}
                      />
                    ))}
                  </span>
                  <span className="mt-1 hidden space-y-0.5 sm:block">
                    {items.slice(0, 2).map((i) => (
                      <span
                        key={`${i.kind}-${i.id}`}
                        className={`block truncate border-s-2 ps-1 text-xs ${KIND[i.kind].bar}`}
                      >
                        {i.label}
                      </span>
                    ))}
                    {items.length > 2 && (
                      <span className="block text-xs text-muted">
                        {t("calendar.more", { n: items.length - 2 })}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {view === "week" && (
        <div className="grid gap-3 md:grid-cols-7">
          {weekDays.map((iso) => {
            const items = itemsFor(iso);
            return (
              <Card
                key={iso}
                className={`!p-3 ${iso === selected ? "ring-2 ring-accent" : ""}`}
              >
                <button
                  onClick={() => setSelected(iso)}
                  className="mb-2 w-full text-start text-sm font-medium"
                >
                  {shortDay(iso)} {fromISO(iso).getDate()}
                  {iso === today ? ` ${t("calendar.todayMark")}` : ""}
                </button>
                {items.length === 0 ? (
                  <p className="text-xs text-muted">
                    {t("calendar.nothingScheduled")}
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {items.map((i) => (
                      <li
                        key={`${i.kind}-${i.id}`}
                        className={`border-s-2 ps-2 text-xs ${KIND[i.kind].bar}`}
                      >
                        {i.time && (
                          <span className="text-muted" dir="ltr">
                            {i.time}{" "}
                          </span>
                        )}
                        {i.label}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Card className="space-y-4">
        <h2 className="font-semibold">{longDate(selected)}</h2>

        {dayItems.length === 0 ? (
          <Empty
            title={t("calendar.nothingScheduled")}
            text={t("calendar.nothingText")}
          />
        ) : (
          <ul className="divide-y divide-line">
            {dayItems.map((i) => (
              <li
                key={`${i.kind}-${i.id}`}
                className="flex items-center gap-3 py-2 text-sm"
              >
                <span
                  className={`size-2 shrink-0 rounded-full ${KIND[i.kind].dot}`}
                  aria-hidden="true"
                />
                <span className="w-28 shrink-0 text-muted">
                  {t(KIND[i.kind].key)}
                </span>
                <span
                  className={`min-w-0 flex-1 ${i.done ? "text-muted line-through" : ""}`}
                >
                  {i.label}
                </span>
                {i.time && (
                  <span className="text-muted" dir="ltr">
                    {i.time}
                  </span>
                )}
                {i.kind === "event" && (
                  <button
                    onClick={() => removeEvent(i.id)}
                    aria-label={t("common.deleteItem", { title: i.label })}
                    className="text-muted hover:text-ink"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={submit}
          className="flex flex-wrap gap-2 border-t border-line pt-4"
        >
          <input
            aria-label={t("today.eventTitle")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("calendar.addEventPlaceholder")}
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
            {t("calendar.addEvent")}
          </button>
        </form>
      </Card>
    </div>
  );
}
