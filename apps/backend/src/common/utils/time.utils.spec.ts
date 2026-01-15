import { getKstDayKey } from './time.utils';

describe('getKstDayKey', () => {
  it('기본 baseHour=4(오전 4시) 기준으로 날짜 문자열을 반환한다', () => {
    const now = new Date(Date.UTC(2026, 0, 1, 0, 0, 0)); // 2026-01-01T00:00:00Z

    const result = getKstDayKey(now);

    expect(result).toBe('2026-01-01');
  });

  it('기본 baseHour=4(오전 4시) 기준으로 날짜가 넘어가면 다음 날짜를 반환한다', () => {
    const now = new Date(Date.UTC(2026, 0, 1, 20, 0, 0)); // 2026-01-01T20:00:00Z -> KST:2026-01-02T05:00:00Z

    const result = getKstDayKey(now);

    expect(result).toBe('2026-01-02');
  });

  it('baseHour를 변경하면 기준 날짜가 달라진다', () => {
    const now = new Date(Date.UTC(2026, 0, 1, 16, 0, 0));

    const result = getKstDayKey(now, 0); // 날짜 변경 기준 시간을 00:00으로 설정

    expect(result).toBe('2026-01-02');
  });

  it('baseHour(기본 오전 4시)부터는 해당 날짜로 계산한다', () => {
    const kstThreeFiftyNine = new Date(Date.UTC(2025, 11, 31, 18, 59, 0)); // KST 2026-01-01 03:59
    const kstFourAM = new Date(Date.UTC(2025, 11, 31, 19, 0, 0)); // KST 2026-01-01 04:00

    expect(getKstDayKey(kstThreeFiftyNine)).toBe('2025-12-31');
    expect(getKstDayKey(kstFourAM)).toBe('2026-01-01');
  });
});
