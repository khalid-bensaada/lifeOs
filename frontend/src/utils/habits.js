import { daysBetween, todayISO, lastDays } from "./dates";

export function streaks(logs) {
  const dates = [...new Set(logs)].sort();
  if (!dates.length) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    run = daysBetween(dates[i], dates[i - 1]) <= 2 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const alive = daysBetween(todayISO(), dates[dates.length - 1]) <= 2;
  return { current: alive ? run : 0, best };
}

export const rate = (logs, days) => {
  const set = new Set(logs);
  const done = lastDays(days).filter((d) => set.has(d)).length;
  return Math.round((100 * done) / days);
};
