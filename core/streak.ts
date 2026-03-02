function normalizeDate(input: Date) {
  return input.toISOString().slice(0, 10);
}

function previousDate(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
}

export function calculateCurrentStreak(dates: string[], now = new Date()) {
  const unique = new Set(dates);
  let streak = 0;
  let cursor = new Date(now);

  while (unique.has(normalizeDate(cursor))) {
    streak += 1;
    cursor = previousDate(cursor);
  }

  return streak;
}
