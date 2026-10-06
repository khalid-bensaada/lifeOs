import { lastDays } from "./dates";
import { FOCUS } from "./time";
import { computeScore } from "./stats";

const LEARNING = [
  "Programming",
  "Design",
  "Video Editing",
  "3D",
  "French",
  "Reading",
];

const sum = (list) => list.reduce((n, x) => n + x.seconds, 0);

export function weekStats({ tasks, habits, entries, goals }) {
  const range = new Set(lastDays(7));
  const inRange = entries.filter((x) => range.has(x.date));
  const counted = tasks.filter((t) => t.status !== "skipped");
  const habitDays = habits.reduce(
    (n, h) => n + h.logs.filter((d) => range.has(d)).length,
    0,
  );

  return {
    score: computeScore({ tasks, habits, entries, goals }, 7).total,
    focus: sum(inRange.filter((x) => FOCUS.includes(x.category))),
    learning: sum(inRange.filter((x) => LEARNING.includes(x.category))),
    tasksDone: counted.filter((t) => t.status === "completed").length,
    tasksTotal: counted.length,
    habits: habits.length
      ? Math.round((100 * habitDays) / (habits.length * 7))
      : 0,
    workouts: inRange.filter((x) => x.category === "Gym").length,
  };
}
