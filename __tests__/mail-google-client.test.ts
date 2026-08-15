import { describe, expect, it, vi } from 'vitest';
import {
  exchangeGmailAuthorizationCode,
  fetchGmailInbox,
  fetchGmailMessageDetail,
  fetchGmailProfile,
  refreshGmailAccessToken,
  revokeGoogleToken,
  sendGmailMessage,
  trashGmailMessage,
} from '../lib/mail/google-client';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
type MailFetcher = (input: string | URL, init?: RequestInit) => Promise<Response>;

describe('Google Gmail 서버 클라이언트', () => {
  it('authorization code 교환에 PKCE verifier와 고정 redirect URI를 포함한다', async () => {
    const fetcher = vi.fn<MailFetcher>(async () => new Response(JSON.stringify({
      access_token: 'access-secret',
      refresh_token: 'refresh-secret',
      expires_in: 3600,
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify',
      token_type: 'Bearer',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    const result = await exchangeGmailAuthorizationCode({
      code: 'authorization-code',
      codeVerifier: 'pkce-verifier',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      redirectUri: 'https://leedonggun.co.kr/api/mail/gmail/callback',
      fetcher,
    });

    expect(result.refreshToken).toBe('refresh-secret');
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, init = {}] = fetcher.mock.calls[0]!;
    expect(url).toBe(TOKEN_URL);
    expect(init.method).toBe('POST');
    const body = new URLSearchParams(init.body as string);
    expect(body.get('code_verifier')).toBe('pkce-verifier');
    expect(body.get('redirect_uri')).toBe('https://leedonggun.co.kr/api/mail/gmail/callback');
  });

  it('Google이 scope를 생략하면 요청한 Gmail 읽기·발송·사서함 변경 scope로 정규화한다', async () => {
    const fetcher = vi.fn<MailFetcher>(async () => Response.json({
      access_token: 'access-secret',
      refresh_token: 'refresh-secret',
      expires_in: 3600,
    }));

    const result = await exchangeGmailAuthorizationCode({
      code: 'authorization-code',
      codeVerifier: 'pkce-verifier',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      redirectUri: 'https://leedonggun.co.kr/api/mail/gmail/callback',
      fetcher,
    });

    expect(result.scopes).toEqual([
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
    ]);
  });

  it('Google이 추가 scope를 반환하면 연결을 거부한다', async () => {
    const fetcher = vi.fn<MailFetcher>(async () => Response.json({
      access_token: 'access-secret',
      refresh_token: 'refresh-secret',
      expires_in: 3600,
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify openid',
    }));

    await expect(exchangeGmailAuthorizationCode({
      code: 'authorization-code',
      codeVerifier: 'pkce-verifier',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      redirectUri: 'https://leedonggun.co.kr/api/mail/gmail/callback',
      fetcher,
    })).rejects.toThrow('Gmail 권한');
  });

  it('refresh token으로 access token을 메모리에서만 발급한다', async () => {
    const fetcher = vi.fn<MailFetcher>(async () => new Response(JSON.stringify({
      access_token: 'new-access-secret',
      expires_in: 3600,
      scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify',
      token_type: 'Bearer',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    await expect(refreshGmailAccessToken({
      refreshToken: 'refresh-secret',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      fetcher,
    })).resolves.toMatchObject({ accessToken: 'new-access-secret' });
  });

  it('Gmail profile에서 공급자 계정 ID와 이메일만 읽는다', async () => {
    const fetcher = vi.fn<MailFetcher>(async () => Response.json({
      emailAddress: 'Owner@Gmail.com',
      messagesTotal: 12345,
      threadsTotal: 6789,
      historyId: 'sensitive-history-id',
    }));

    await expect(fetchGmailProfile('access-secret', fetcher)).resolves.toEqual({
      accountId: 'owner@gmail.com',
      email: 'owner@gmail.com',
    });
  });

  it('최근 메일을 최대 50건으로 제한하고 metadata 헤더만 조회한다', async () => {
    const fetcher = vi.fn<MailFetcher>(async (input) => {
      const url = new URL(input);
      if (url.pathname.endsWith('/labels/INBOX')) {
        return Response.json({ messagesUnread: 7 });
      }
      if (url.pathname.endsWith('/messages')) {
        return Response.json({ messages: [{ id: 'm1', threadId: 't1' }] });
      }
      return Response.json({
        id: 'm1',
        threadId: 't1',
        labelIds: ['INBOX', 'UNREAD'],
        internalDate: '1786742400000',
        snippet: '읽기 전용 미리보기',
        payload: { headers: [{ name: 'From', value: 'sender@example.com' }, { name: 'Subject', value: '확인 요청' }] },
      });
    });

    const result = await fetchGmailInbox({ accessToken: 'access-secret', limit: 999, fetcher });

    expect(result.unreadCount).toBe(7);
    expect(result.messages).toHaveLength(1);
    const requestedUrls = fetcher.mock.calls.map(([input]) => new URL(input));
    const listUrl = requestedUrls.find((url) => url.pathname.endsWith('/messages'));
    const metadataUrl = requestedUrls.find((url) => /\/messages\/m1$/.test(url.pathname));
    expect(listUrl?.searchParams.get('maxResults')).toBe('50');
    expect(listUrl?.searchParams.get('labelIds')).toBe('INBOX');
    expect(metadataUrl?.searchParams.get('format')).toBe('metadata');
    expect(metadataUrl?.searchParams.getAll('metadataHeaders')).toEqual(['From', 'Subject', 'Date']);
    expect(JSON.stringify(result)).not.toContain('access-secret');
  });

  it('선택한 Gmail 메시지 1건을 full 형식으로 조회해 텍스트 상세만 반환한다', async () => {
    const fetcher = vi.fn<MailFetcher>(async () => Response.json({
      id: 'message_detail',
      threadId: 'thread_detail',
      internalDate: '1786742400000',
      payload: {
        mimeType: 'text/plain',
        headers: [
          { name: 'From', value: 'sender@example.com' },
          { name: 'Subject', value: '상세 확인' },
        ],
        body: { data: Buffer.from('본문입니다.', 'utf8').toString('base64url') },
      },
    }));

    const result = await fetchGmailMessageDetail({
      accessToken: 'access-secret',
      messageId: 'message_detail',
      fetcher,
    });

    expect(result.bodyText).toBe('본문입니다.');
    const [input, init = {}] = fetcher.mock.calls[0]!;
    const url = new URL(input);
    expect(url.pathname).toBe('/gmail/v1/users/me/messages/message_detail');
    expect(url.searchParams.get('format')).toBe('full');
    expect(init.method).toBe('GET');
    expect(JSON.stringify(result)).not.toContain('access-secret');
  });

  it('검증된 메시지 1건만 Gmail trash endpoint로 이동한다', async () => {
    const fetcher = vi.fn<MailFetcher>(async () => Response.json({
      id: 'message_trash',
      threadId: 'thread_trash',
      labelIds: ['TRASH'],
    }));

    await expect(trashGmailMessage({
      accessToken: 'access-secret',
      messageId: 'message_trash',
      fetcher,
    })).resolves.toEqual({ id: 'message_trash', threadId: 'thread_trash' });

    const [input, init = {}] = fetcher.mock.calls[0]!;
    expect(new URL(input).pathname).toBe('/gmail/v1/users/me/messages/message_trash/trash');
    expect(init.method).toBe('POST');
    expect(init.body).toBeUndefined();
  });

  it('비정상 Gmail 메시지 ID는 provider 호출 전에 거부한다', async () => {
    const fetcher = vi.fn<MailFetcher>();
    await expect(fetchGmailMessageDetail({
      accessToken: 'access-secret',
      messageId: '../evil',
      fetcher,
    })).rejects.toThrow('Gmail 메시지 ID');
    await expect(trashGmailMessage({
      accessToken: 'access-secret',
      messageId: 'https://evil.example',
      fetcher,
    })).rejects.toThrow('Gmail 메시지 ID');
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('공급자 오류 본문이나 토큰을 예외 메시지에 노출하지 않는다', async () => {
    const fetcher = vi.fn<MailFetcher>(async () => new Response(
      JSON.stringify({ error: 'invalid_grant', error_description: 'refresh-secret exposed' }),
      { status: 400 },
    ));

    await expect(refreshGmailAccessToken({
      refreshToken: 'refresh-secret',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      fetcher,
    })).rejects.toThrow('Google 인증을 갱신하지 못했습니다');
    try {
      await refreshGmailAccessToken({
        refreshToken: 'refresh-secret',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        fetcher,
      });
    } catch (error) {
      expect(String(error)).not.toContain('refresh-secret');
      expect(String(error)).not.toContain('invalid_grant');
    }
  });

  it('연결 해제는 Google 고정 revoke endpoint를 사용한다', async () => {
    const fetcher = vi.fn<MailFetcher>(async () => new Response(null, { status: 200 }));
    await revokeGoogleToken('refresh-secret', fetcher);
    const [url, init = {}] = fetcher.mock.calls[0]!;
    expect(new URL(url).origin + new URL(url).pathname).toBe('https://oauth2.googleapis.com/revoke');
    expect(init.method).toBe('POST');
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('검증된 일반 텍스트 메일을 Gmail send endpoint로만 전송한다', async () => {
    const fetcher = vi.fn<MailFetcher>(async () => Response.json({ id: 'sent-id', threadId: 'thread-id' }));

    await expect(sendGmailMessage({
      accessToken: 'access-secret',
      message: {
        to: 'recipient@example.com',
        subject: '발송 확인',
        text: '일반 텍스트 본문입니다.',
        threadId: 'thread-reply',
        inReplyTo: '<message@example.com>',
        references: ['<older@example.com>', '<message@example.com>'],
      },
      fetcher,
    })).resolves.toEqual({ id: 'sent-id', threadId: 'thread-id' });

    const [input, init = {}] = fetcher.mock.calls[0]!;
    expect(new URL(input).pathname).toBe('/gmail/v1/users/me/messages/send');
    expect(init.method).toBe('POST');
    const payload = JSON.parse(String(init.body)) as { raw: string; threadId?: string };
    expect(payload.threadId).toBe('thread-reply');
    const mime = Buffer.from(payload.raw, 'base64url').toString('utf8');
    expect(mime).toContain('To: recipient@example.com');
    expect(mime).toContain('Subject: =?UTF-8?B?');
    expect(mime).toContain('Content-Type: text/plain; charset=UTF-8');
    expect(mime).not.toContain('access-secret');
  });
});
