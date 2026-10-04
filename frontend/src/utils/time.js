import { daysAgo } from "./dates";

export const fmt = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m`;
  return `${s}s`;
};

export const clock = (s) =>
  [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");

export const FOCUS = [
  "Programming",
  "Design",
  "Video Editing",
  "3D",
  "French",
  "School",
  "Reading",
];

export const focusSeconds = (entries, offset, days) => {
  const set = new Set(
    Array.from({ length: days }, (_, i) => daysAgo(offset + i)),
  );
  return entries
    .filter((x) => set.has(x.date) && FOCUS.includes(x.category))
    .reduce((n, x) => n + x.seconds, 0);
};
