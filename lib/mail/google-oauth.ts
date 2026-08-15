import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { decryptToken, encryptToken } from './token-crypto';

export const GMAIL_READONLY_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
export const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
export const GMAIL_MODIFY_SCOPE = 'https://www.googleapis.com/auth/gmail.modify';
export const GMAIL_REQUIRED_SCOPES = [GMAIL_READONLY_SCOPE, GMAIL_SEND_SCOPE, GMAIL_MODIFY_SCOPE] as const;

const GOOGLE_AUTHORIZATION_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const OAUTH_FLOW_TTL_MS = 10 * 60_000;

export function hasRequiredGmailScopes(scopes: readonly string[]): boolean {
  const normalized = Array.from(new Set(scopes)).sort();
  return normalized.length === GMAIL_REQUIRED_SCOPES.length
    && GMAIL_REQUIRED_SCOPES.every((scope) => normalized.includes(scope));
}

interface OAuthFlowPayload {
  state: string;
  codeVerifier: string;
  expiresAt: number;
}

interface CreateGmailOAuthFlowOptions {
  userId: string;
  clientId: string;
  publicBaseUrl: string;
  encryptionKey: string;
  nodeEnv?: string;
  now?: number;
}

interface ConsumeGmailOAuthFlowOptions {
  cookieValue: string | undefined;
  returnedState: string | null;
  userId: string;
  encryptionKey: string;
  now?: number;
}

function randomBase64Url(bytes: number): string {
  return randomBytes(bytes).toString('base64url');
}

function isValidFlowPayload(value: unknown): value is OAuthFlowPayload {
  if (!value || typeof value !== 'object') return false;
  const payload = value as Partial<OAuthFlowPayload>;
  return (
    typeof payload.state === 'string'
    && /^[A-Za-z0-9_-]{43,}$/.test(payload.state)
    && typeof payload.codeVerifier === 'string'
    && /^[A-Za-z0-9_-]{43,128}$/.test(payload.codeVerifier)
    && typeof payload.expiresAt === 'number'
    && Number.isSafeInteger(payload.expiresAt)
  );
}

function statesMatch(expected: string, returned: string): boolean {
  const expectedBytes = Buffer.from(expected);
  const returnedBytes = Buffer.from(returned);
  return expectedBytes.length === returnedBytes.length && timingSafeEqual(expectedBytes, returnedBytes);
}

export function getGmailRedirectUri(
  publicBaseUrl: string,
  nodeEnv: string = process.env.NODE_ENV ?? 'production',
): string {
  const url = new URL(publicBaseUrl);
  const isLocalDevelopment = (
    nodeEnv === 'development'
    && url.protocol === 'http:'
    && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
  );
  if (url.protocol !== 'https:' && !isLocalDevelopment) {
    throw new Error('메일 공개 기준 URL은 HTTPS여야 합니다');
  }
  if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('메일 공개 기준 URL은 경로 없는 origin이어야 합니다');
  }
  return `${url.origin}/api/mail/gmail/callback`;
}

export function createGmailOAuthFlow(options: CreateGmailOAuthFlowOptions) {
  const now = options.now ?? Date.now();
  const state = randomBase64Url(32);
  const codeVerifier = randomBase64Url(64);
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');
  const redirectUri = getGmailRedirectUri(options.publicBaseUrl, options.nodeEnv);
  const payload: OAuthFlowPayload = {
    state,
    codeVerifier,
    expiresAt: now + OAUTH_FLOW_TTL_MS,
  };
  const cookieValue = encryptToken(
    JSON.stringify(payload),
    { userId: options.userId, provider: 'gmail', tokenKind: 'pkce' },
    options.encryptionKey,
  );

  const authorizationUrl = new URL(GOOGLE_AUTHORIZATION_URL);
  authorizationUrl.search = new URLSearchParams({
    client_id: options.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GMAIL_REQUIRED_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'false',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }).toString();

  return { authorizationUrl: authorizationUrl.toString(), cookieValue, state };
}

export function consumeGmailOAuthFlow(options: ConsumeGmailOAuthFlowOptions) {
  if (!options.cookieValue || !options.returnedState) {
    throw new Error('OAuth 요청을 확인할 수 없습니다');
  }

  let payload: unknown;
  try {
    payload = JSON.parse(decryptToken(
      options.cookieValue,
      { userId: options.userId, provider: 'gmail', tokenKind: 'pkce' },
      options.encryptionKey,
    ));
  } catch {
    throw new Error('OAuth 요청을 확인할 수 없습니다');
  }

  if (!isValidFlowPayload(payload) || !statesMatch(payload.state, options.returnedState)) {
    throw new Error('OAuth 요청을 확인할 수 없습니다');
  }

  const now = options.now ?? Date.now();
  if (payload.expiresAt <= now || payload.expiresAt > now + OAUTH_FLOW_TTL_MS) {
    throw new Error('OAuth 요청이 만료되었습니다');
  }

  return { codeVerifier: payload.codeVerifier };
}
