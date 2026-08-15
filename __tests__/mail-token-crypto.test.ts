import { describe, expect, it } from 'vitest';
import { decryptToken, encryptToken } from '../lib/mail/token-crypto';

const KEY = Buffer.alloc(32, 7).toString('base64');
const OTHER_KEY = Buffer.alloc(32, 8).toString('base64');
const CONTEXT = { userId: 'user-1', provider: 'gmail' as const, tokenKind: 'refresh' as const };

describe('메일 OAuth 토큰 암호화', () => {
  it('AES-256-GCM으로 왕복하고 같은 평문에도 매번 다른 암호문을 만든다', () => {
    const first = encryptToken('refresh-token-value', CONTEXT, KEY);
    const second = encryptToken('refresh-token-value', CONTEXT, KEY);

    expect(first).not.toBe(second);
    expect(first).not.toContain('refresh-token-value');
    expect(decryptToken(first, CONTEXT, KEY)).toBe('refresh-token-value');
    expect(decryptToken(second, CONTEXT, KEY)).toBe('refresh-token-value');
  });

  it('잘못된 키와 다른 사용자·공급자·토큰 종류로 복호화하지 못한다', () => {
    const encrypted = encryptToken('secret-token', CONTEXT, KEY);

    expect(() => decryptToken(encrypted, CONTEXT, OTHER_KEY)).toThrow('토큰 복호화에 실패했습니다');
    expect(() => decryptToken(encrypted, { ...CONTEXT, userId: 'user-2' }, KEY)).toThrow();
    expect(() => decryptToken(encrypted, { ...CONTEXT, provider: 'outlook' }, KEY)).toThrow();
    expect(() => decryptToken(encrypted, { ...CONTEXT, tokenKind: 'access' }, KEY)).toThrow();
  });

  it('32바이트가 아닌 키와 변조된 암호문을 기본 거부한다', () => {
    expect(() => encryptToken('token', CONTEXT, Buffer.alloc(31).toString('base64'))).toThrow('32바이트');

    const encrypted = encryptToken('token', CONTEXT, KEY);
    const parts = encrypted.split('.');
    const tag = Buffer.from(parts[2], 'base64url');
    tag[0] ^= 1;
    parts[2] = tag.toString('base64url');
    expect(() => decryptToken(parts.join('.'), CONTEXT, KEY)).toThrow('토큰 복호화에 실패했습니다');

    const nonCanonical = encrypted.replace(/\.([^.]*)\./, (_match: string, value: string) => `.${value}=.`);
    expect(() => decryptToken(nonCanonical, CONTEXT, KEY)).toThrow('토큰 복호화에 실패했습니다');
  });
});
