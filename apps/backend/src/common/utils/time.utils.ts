export function getKstDayKey(now = new Date(), baseHour = 4) {
  const MILLISECONDS_PER_HOUR = 3_600_000;
  const kstMillis = now.getTime() + (9 - baseHour) * MILLISECONDS_PER_HOUR;

  return new Date(kstMillis).toISOString().slice(0, 10);
}
