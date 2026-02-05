import { describe, it, expect } from 'vitest';
import { urlBase64ToUint8Array } from './base64-converter';

describe('urlBase64ToUint8Array', () => {
  it('패딩 없이도 올바르게 디코딩한다', () => {
    const result = urlBase64ToUint8Array('AQAB');
    expect(Array.from(result)).toEqual([1, 0, 1]);
  });

  it('누락된 패딩을 자동으로 보정한다', () => {
    const result = urlBase64ToUint8Array('Zg');
    expect(Array.from(result)).toEqual([102]);
  });

  it('base64url 문자(-, _)를 표준 base64로 변환한다', () => {
    const result = urlBase64ToUint8Array('--__');
    expect(Array.from(result)).toEqual([251, 239, 255]);
  });
});
