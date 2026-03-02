function normalizeDate(input: Date) {
  return input.toISOString().slice(0, 10);
}

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

export function countThisWeek(dates: string[], now = new Date()) {
  const start = normalizeDate(startOfWeek(now));
  const unique = new Set(dates);
  return [...unique].filter((date) => date >= start).length;
}

export function isTodayLogged(dates: string[], now = new Date()) {
  const today = normalizeDate(now);
  return new Set(dates).has(today);
}
