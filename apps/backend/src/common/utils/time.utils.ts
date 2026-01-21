// KST(UTC+9) 기준 날짜 키(YYYY-MM-DD)를 만든다.
// 기본 baseHour=4: 하루 기준을 새벽 4시로 맞춘 뒤 날짜를 계산.
const BASE_HOUR = 4;

export function getKstDayKey(now = new Date(), baseHour = BASE_HOUR) {
  const MILLISECONDS_PER_HOUR = 3_600_000;
  const kstMillis = now.getTime() + (9 - baseHour) * MILLISECONDS_PER_HOUR;

  return new Date(kstMillis).toISOString().slice(0, 10);
}

export function addDays(date: Date, delta: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

export function toKstBoundary(dateKey: string, baseHour = BASE_HOUR) {
  return new Date(`${dateKey}T${String(baseHour).padStart(2, '0')}:00:00+09:00`);
}
