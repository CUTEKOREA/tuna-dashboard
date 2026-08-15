import { describe, expect, it } from 'vitest';
import {
  GMAIL_READONLY_SCOPE,
  GMAIL_REQUIRED_SCOPES,
  GMAIL_SEND_SCOPE,
  createGmailOAuthFlow,
  consumeGmailOAuthFlow,
  getGmailRedirectUri,
  hasRequiredGmailScopes,
} from '../lib/mail/google-oauth';

const KEY = Buffer.alloc(32, 9).toString('base64');
const NOW = 1_786_742_400_000;

function createFlow() {
  return createGmailOAuthFlow({
    userId: 'user-1',
    clientId: 'client-id.apps.googleusercontent.com',
    publicBaseUrl: 'https://leedonggun.co.kr',
    encryptionKey: KEY,
    now: NOW,
  });
}

describe('Gmail OAuth state와 PKCE', () => {
  it('읽기·발송 최소 scope, offline access, consent, S256 PKCE를 고정한다', () => {
    const flow = createFlow();
    const url = new URL(flow.authorizationUrl);

    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('scope')).toBe(GMAIL_REQUIRED_SCOPES.join(' '));
    expect(GMAIL_REQUIRED_SCOPES).toEqual([GMAIL_READONLY_SCOPE, GMAIL_SEND_SCOPE]);
    expect(url.searchParams.get('access_type')).toBe('offline');
    expect(url.searchParams.get('prompt')).toBe('consent');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('code_challenge')).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(url.searchParams.get('redirect_uri')).toBe('https://leedonggun.co.kr/api/mail/gmail/callback');
    expect(flow.cookieValue).not.toContain(flow.state);
    expect(flow.authorizationUrl).not.toContain('client-secret');
  });

  it('읽기·발송 scope가 정확히 모두 있을 때만 허용한다', () => {
    expect(hasRequiredGmailScopes([GMAIL_SEND_SCOPE, GMAIL_READONLY_SCOPE])).toBe(true);
    expect(hasRequiredGmailScopes([GMAIL_READONLY_SCOPE])).toBe(false);
    expect(hasRequiredGmailScopes([GMAIL_SEND_SCOPE])).toBe(false);
    expect(hasRequiredGmailScopes([...GMAIL_REQUIRED_SCOPES, 'openid'])).toBe(false);
  });

  it('요청 Host가 아니라 고정 공개 기준 URL로 callback URI를 만든다', () => {
    expect(getGmailRedirectUri('https://leedonggun.co.kr/')).toBe(
      'https://leedonggun.co.kr/api/mail/gmail/callback',
    );
    expect(getGmailRedirectUri('http://localhost:3000', 'development')).toBe(
      'http://localhost:3000/api/mail/gmail/callback',
    );
    expect(getGmailRedirectUri('http://127.0.0.1:3000', 'development')).toBe(
      'http://127.0.0.1:3000/api/mail/gmail/callback',
    );
    expect(() => getGmailRedirectUri('http://localhost:3000', 'production')).toThrow('HTTPS');
    expect(() => getGmailRedirectUri('http://evil.example', 'development')).toThrow('HTTPS');
    expect(() => getGmailRedirectUri('https://leedonggun.co.kr/path')).toThrow('origin');
  });

  it('state를 매번 무작위로 만들고 올바른 사용자·state만 10분 안에 소비한다', () => {
    const first = createFlow();
    const second = createFlow();
    expect(first.state).not.toBe(second.state);

    const consumed = consumeGmailOAuthFlow({
      cookieValue: first.cookieValue,
      returnedState: first.state,
      userId: 'user-1',
      encryptionKey: KEY,
      now: NOW + 9 * 60_000,
    });
    expect(consumed.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/);

    expect(() => consumeGmailOAuthFlow({
      cookieValue: first.cookieValue,
      returnedState: 'wrong-state',
      userId: 'user-1',
      encryptionKey: KEY,
      now: NOW,
    })).toThrow('OAuth 요청을 확인할 수 없습니다');
    expect(() => consumeGmailOAuthFlow({
      cookieValue: first.cookieValue,
      returnedState: first.state,
      userId: 'user-2',
      encryptionKey: KEY,
      now: NOW,
    })).toThrow('OAuth 요청을 확인할 수 없습니다');
    expect(() => consumeGmailOAuthFlow({
      cookieValue: first.cookieValue,
      returnedState: first.state,
      userId: 'user-1',
      encryptionKey: KEY,
      now: NOW + 10 * 60_000 + 1,
    })).toThrow('OAuth 요청이 만료되었습니다');
  });
});
