import { GMAIL_REQUIRED_SCOPES, hasRequiredGmailScopes } from './google-oauth';
import { parseGmailMessageDetail, type GmailDetailResource, type MailMessageDetail } from './gmail-detail';
import { parseGmailMessage, type GmailMessageResource, type MailListItem } from './gmail-parser';
import { buildGmailRawMessage, type GmailSendMessage } from './send-message';

type MailFetcher = (input: string | URL, init?: RequestInit) => Promise<Response>;

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const GMAIL_API_URL = 'https://gmail.googleapis.com/gmail/v1/users/me';
const GMAIL_METADATA_CONCURRENCY = 8;
const GOOGLE_REQUEST_TIMEOUT_MS = 15_000;

function googleRequestSignal(): AbortSignal {
  return AbortSignal.timeout(GOOGLE_REQUEST_TIMEOUT_MS);
}

interface GoogleTokenResponse {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  scope?: unknown;
  token_type?: unknown;
}

interface ExchangeCodeOptions {
  code: string;
  codeVerifier: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  fetcher?: MailFetcher;
}

interface RefreshTokenOptions {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  fetcher?: MailFetcher;
}

interface FetchInboxOptions {
  accessToken: string;
  limit: number;
  fetcher?: MailFetcher;
}

interface SendGmailMessageOptions {
  accessToken: string;
  message: GmailSendMessage;
  fetcher?: MailFetcher;
}

interface GmailMessageActionOptions {
  accessToken: string;
  messageId: string;
  fetcher?: MailFetcher;
}

export interface GoogleAccessToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  scopes: string[];
}

const GMAIL_RESOURCE_ID = /^[A-Za-z0-9_-]+$/;

function gmailMessageUrl(messageId: string, suffix = ''): URL {
  if (!GMAIL_RESOURCE_ID.test(messageId)) throw new Error('Gmail 메시지 ID를 확인하지 못했습니다');
  return new URL(`${GMAIL_API_URL}/messages/${encodeURIComponent(messageId)}${suffix}`);
}

function parseTokenResponse(value: unknown, requireRefreshToken: boolean): GoogleAccessToken {
  if (!value || typeof value !== 'object') {
    throw new Error('Google 인증 응답을 확인하지 못했습니다');
  }

  const response = value as GoogleTokenResponse;
  if (
    typeof response.access_token !== 'string'
    || !response.access_token
    || typeof response.expires_in !== 'number'
    || !Number.isFinite(response.expires_in)
    || response.expires_in <= 0
    || (requireRefreshToken && (typeof response.refresh_token !== 'string' || !response.refresh_token))
  ) {
    throw new Error('Google 인증 응답을 확인하지 못했습니다');
  }

  const scopes = typeof response.scope === 'string'
    ? response.scope.split(/\s+/).filter(Boolean)
    : [];
  if (scopes.length > 0 && !hasRequiredGmailScopes(scopes)) {
    throw new Error('Gmail 권한을 확인하지 못했습니다');
  }

  return {
    accessToken: response.access_token,
    ...(typeof response.refresh_token === 'string' && response.refresh_token
      ? { refreshToken: response.refresh_token }
      : {}),
    expiresIn: response.expires_in,
    scopes: scopes.length === 0 ? [...GMAIL_REQUIRED_SCOPES] : Array.from(new Set(scopes)).sort(),
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function exchangeGmailAuthorizationCode(
  options: ExchangeCodeOptions,
): Promise<GoogleAccessToken & { refreshToken: string }> {
  const response = await (options.fetcher ?? fetch)(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    cache: 'no-store',
    signal: googleRequestSignal(),
    body: new URLSearchParams({
      code: options.code,
      code_verifier: options.codeVerifier,
      client_id: options.clientId,
      client_secret: options.clientSecret,
      redirect_uri: options.redirectUri,
      grant_type: 'authorization_code',
    }).toString(),
  });
  if (!response.ok) throw new Error('Google 인증을 완료하지 못했습니다');

  const token = parseTokenResponse(await readJson(response), true);
  if (!token.refreshToken) throw new Error('Google 인증 응답을 확인하지 못했습니다');
  return { ...token, refreshToken: token.refreshToken };
}

export async function refreshGmailAccessToken(options: RefreshTokenOptions): Promise<GoogleAccessToken> {
  const response = await (options.fetcher ?? fetch)(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    cache: 'no-store',
    signal: googleRequestSignal(),
    body: new URLSearchParams({
      refresh_token: options.refreshToken,
      client_id: options.clientId,
      client_secret: options.clientSecret,
      grant_type: 'refresh_token',
    }).toString(),
  });
  if (!response.ok) throw new Error('Google 인증을 갱신하지 못했습니다');

  try {
    return parseTokenResponse(await readJson(response), false);
  } catch {
    throw new Error('Google 인증을 갱신하지 못했습니다');
  }
}

async function googleJson(
  url: URL,
  accessToken: string,
  failureMessage: string,
  fetcher: MailFetcher,
): Promise<unknown> {
  const response = await fetcher(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
    signal: googleRequestSignal(),
  });
  if (!response.ok) throw new Error(failureMessage);
  const data = await readJson(response);
  if (!data || typeof data !== 'object') throw new Error(failureMessage);
  return data;
}

export async function fetchGmailProfile(
  accessToken: string,
  fetcher: MailFetcher = fetch,
): Promise<{ accountId: string; email: string }> {
  const value = await googleJson(
    new URL(`${GMAIL_API_URL}/profile`),
    accessToken,
    'Gmail 계정 정보를 불러오지 못했습니다',
    fetcher,
  );
  const email = (value as { emailAddress?: unknown }).emailAddress;
  if (typeof email !== 'string' || !email.trim()) {
    throw new Error('Gmail 계정 정보를 불러오지 못했습니다');
  }
  const normalizedEmail = email.trim().toLowerCase();
  return { accountId: normalizedEmail, email: normalizedEmail };
}

export async function fetchGmailInbox(options: FetchInboxOptions): Promise<{
  unreadCount: number;
  messages: MailListItem[];
}> {
  const fetcher = options.fetcher ?? fetch;
  const limit = Math.min(50, Math.max(1, Math.trunc(options.limit) || 20));
  const labelValue = await googleJson(
    new URL(`${GMAIL_API_URL}/labels/INBOX`),
    options.accessToken,
    'Gmail 안 읽은 메일 수를 불러오지 못했습니다',
    fetcher,
  );
  const unreadValue = (labelValue as { messagesUnread?: unknown }).messagesUnread;
  const unreadCount = typeof unreadValue === 'number' && Number.isFinite(unreadValue)
    ? Math.max(0, Math.trunc(unreadValue))
    : 0;

  const listUrl = new URL(`${GMAIL_API_URL}/messages`);
  listUrl.searchParams.set('labelIds', 'INBOX');
  listUrl.searchParams.set('maxResults', String(limit));
  const listValue = await googleJson(
    listUrl,
    options.accessToken,
    'Gmail 메일 목록을 불러오지 못했습니다',
    fetcher,
  );
  const references = Array.isArray((listValue as { messages?: unknown }).messages)
    ? (listValue as { messages: Array<{ id?: unknown }> }).messages
    : [];

  const selectedReferences = references.slice(0, limit);
  const messages: MailListItem[] = [];
  for (let start = 0; start < selectedReferences.length; start += GMAIL_METADATA_CONCURRENCY) {
    const batch = selectedReferences.slice(start, start + GMAIL_METADATA_CONCURRENCY);
    const parsedBatch = await Promise.all(batch.map(async (reference) => {
      if (typeof reference.id !== 'string' || !reference.id) {
        throw new Error('Gmail 메일 목록을 불러오지 못했습니다');
      }
      const messageUrl = new URL(`${GMAIL_API_URL}/messages/${encodeURIComponent(reference.id)}`);
      messageUrl.searchParams.set('format', 'metadata');
      for (const header of ['From', 'Subject', 'Date']) {
        messageUrl.searchParams.append('metadataHeaders', header);
      }
      const message = await googleJson(
        messageUrl,
        options.accessToken,
        'Gmail 메일을 불러오지 못했습니다',
        fetcher,
      );
      return parseGmailMessage(message as GmailMessageResource);
    }));
    messages.push(...parsedBatch);
  }

  return { unreadCount, messages };
}

export async function fetchGmailMessageDetail(
  options: GmailMessageActionOptions,
): Promise<MailMessageDetail> {
  const fetcher = options.fetcher ?? fetch;
  const url = gmailMessageUrl(options.messageId);
  url.searchParams.set('format', 'full');
  const message = await googleJson(
    url,
    options.accessToken,
    'Gmail 메일 상세를 불러오지 못했습니다',
    fetcher,
  );
  return parseGmailMessageDetail(message as GmailDetailResource);
}

export async function trashGmailMessage(
  options: GmailMessageActionOptions,
): Promise<{ id: string; threadId: string }> {
  const url = gmailMessageUrl(options.messageId, '/trash');
  const response = await (options.fetcher ?? fetch)(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${options.accessToken}` },
    cache: 'no-store',
    signal: googleRequestSignal(),
  });
  if (!response.ok) throw new Error('Gmail 메일을 휴지통으로 이동하지 못했습니다');
  const value = await readJson(response) as { id?: unknown; threadId?: unknown } | null;
  if (typeof value?.id !== 'string' || !GMAIL_RESOURCE_ID.test(value.id)
    || typeof value.threadId !== 'string' || !GMAIL_RESOURCE_ID.test(value.threadId)) {
    throw new Error('Gmail 휴지통 이동 응답을 확인하지 못했습니다');
  }
  return { id: value.id, threadId: value.threadId };
}

export async function sendGmailMessage(options: SendGmailMessageOptions): Promise<{
  id: string;
  threadId: string;
}> {
  const response = await (options.fetcher ?? fetch)(`${GMAIL_API_URL}/messages/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
    signal: googleRequestSignal(),
    body: JSON.stringify({
      raw: buildGmailRawMessage(options.message),
      ...(options.message.threadId ? { threadId: options.message.threadId } : {}),
    }),
  });
  if (!response.ok) throw new Error('Gmail 메일을 발송하지 못했습니다');
  const value = await readJson(response) as { id?: unknown; threadId?: unknown } | null;
  if (typeof value?.id !== 'string' || !value.id || typeof value.threadId !== 'string' || !value.threadId) {
    throw new Error('Gmail 메일 발송 응답을 확인하지 못했습니다');
  }
  return { id: value.id, threadId: value.threadId };
}

export async function revokeGoogleToken(
  token: string,
  fetcher: MailFetcher = fetch,
): Promise<void> {
  const response = await fetcher(GOOGLE_REVOKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    cache: 'no-store',
    signal: googleRequestSignal(),
    body: new URLSearchParams({ token }).toString(),
  });
  if (!response.ok && response.status !== 400) {
    throw new Error('Google 권한을 철회하지 못했습니다');
  }
}
