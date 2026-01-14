export function getKstDayKey(now = new Date(), baseHour = 4) {
  const kstMillis =
    now.getTime() +
    9 * 60 * 60 * 1000 - // KST
    baseHour * 60 * 60 * 1000; // 기준 시각

  return new Date(kstMillis).toISOString().slice(0, 10);
}
