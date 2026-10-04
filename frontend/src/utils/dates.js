export const toISO = (d) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

export const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
};

export const todayISO = () => daysAgo(0);

export const lastDays = (n) =>
  Array.from({ length: n }, (_, i) => daysAgo(n - 1 - i));

export const daysBetween = (a, b) =>
  Math.round((new Date(a) - new Date(b)) / 86400000);

export const dayName = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    timeZone: "UTC",
  });

export const fromISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (iso, n) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const addMonths = (iso, n) => {
  const d = fromISO(iso);
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  return toISO(d);
};

export const startOfWeek = (iso) =>
  addDays(iso, -((fromISO(iso).getDay() + 6) % 7));

export const monthGrid = (iso) => {
  const d = fromISO(iso);
  const first = toISO(new Date(d.getFullYear(), d.getMonth(), 1));
  const start = startOfWeek(first);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
};
