import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useT } from "../i18n/useT";
import { Card, Empty, Badge, fieldCls, btnCls } from "../components/ui";
import { lastDays, todayISO } from "../utils/dates";
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
    <p className="text-lg font-semibold" dir="ltr">
      {value}
    </p>
    <p className="text-xs text-muted">{label}</p>
  </div>
);

function HabitCard({ h }) {
  const { t, tc, shortDay } = useT();
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
          <Badge>{tc(h.category)}</Badge>
        </div>
        <button
          onClick={() => removeHabit(h.id)}
          aria-label={t("common.deleteItem", { title: h.name })}
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
              <span className="text-xs text-muted">{shortDay(d)}</span>
              <button
                onClick={() => toggleHabitLog(h.id, d)}
                aria-pressed={done}
                aria-label={t("habits.onDay", { name: h.name, date: d })}
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
        <Stat
          label={t("habits.currentStreak")}
          value={t("common.daysShort", { n: current })}
        />
        <Stat
          label={t("habits.bestStreak")}
          value={t("common.daysShort", { n: best })}
        />
        <Stat label={t("habits.thisWeek")} value={`${weekDone}/7`} />
        <Stat label={t("habits.last30")} value={`${rate(h.logs, 30)}%`} />
      </div>
    </Card>
  );
}

export default function Habits() {
  const { t, tc } = useT();
  const { habits, habitsStatus, loadHabits, addHabit } = useApp();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Programming");

  const today = todayISO();
  const doneToday = habits.filter((h) => h.logs.includes(today)).length;

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await addHabit({ name: name.trim(), category });
    if (ok) setName("");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{t("nav.habits")}</h1>
        <p className="text-sm text-muted">
          {t("habits.subtitle", { done: doneToday, total: habits.length })}
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          aria-label={t("habits.nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("habits.placeholder")}
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
        <button className={btnCls}>
          <Plus size={16} aria-hidden="true" />
          {t("habits.addHabit")}
        </button>
      </form>

      {habitsStatus === "loading" && (
        <div aria-busy="true" className="grid gap-5 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl bg-line/60" />
          ))}
        </div>
      )}

      {habitsStatus === "error" && (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-medium">{t("common.somethingWrong")}</p>
          <p className="mt-1 text-sm text-muted">{t("habits.loadError")}</p>
          <button onClick={loadHabits} className={`${btnCls} mt-4`}>
            {t("common.tryAgain")}
          </button>
        </div>
      )}

      {habitsStatus === "ready" &&
        (habits.length === 0 ? (
          <Empty title={t("habits.empty")} text={t("habits.emptyText")} />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {habits.map((h) => (
              <HabitCard key={h.id} h={h} />
            ))}
          </div>
        ))}
    </div>
  );
}
