import { lastDays } from "./dates";
import { FOCUS } from "./time";
import { goalProgress } from "../context/AppContext";

export const focusByDay = (entries, days) =>
  lastDays(days).map((date) => ({
    date,
    seconds: entries
      .filter((x) => x.date === date && FOCUS.includes(x.category))
      .reduce((n, x) => n + x.seconds, 0),
  }));

export function computeScore({ tasks, habits, entries, goals }, days) {
  const range = lastDays(days);
  const set = new Set(range);

  const counted = tasks.filter((t) => t.status !== "skipped");
  const tasksPart = counted.length
    ? counted.filter((t) => t.status === "completed").length / counted.length
    : 0;

  const habitsPart = habits.length
    ? habits.reduce((n, h) => n + h.logs.filter((d) => set.has(d)).length, 0) /
      (habits.length * days)
    : 0;

  const focus = entries
    .filter((x) => set.has(x.date) && FOCUS.includes(x.category))
    .reduce((n, x) => n + x.seconds, 0);
  const focusPart = Math.min(1, focus / (7200 * days));

  const goalsPart = goals.length
    ? goals.reduce((n, g) => n + goalProgress(g), 0) / (100 * goals.length)
    : 0;

  const active = range.filter(
    (d) =>
      entries.some((x) => x.date === d && FOCUS.includes(x.category)) ||
      habits.some((h) => h.logs.includes(d)),
  ).length;
  const consistencyPart = active / days;

  const parts = [
    { key: "tasks", max: 25, value: Math.round(25 * tasksPart) },
    { key: "habits", max: 25, value: Math.round(25 * habitsPart) },
    { key: "focus", max: 25, value: Math.round(25 * focusPart) },
    { key: "goals", max: 15, value: Math.round(15 * goalsPart) },
    { key: "consistency", max: 10, value: Math.round(10 * consistencyPart) },
  ];

  return { total: parts.reduce((n, p) => n + p.value, 0), parts };
}
