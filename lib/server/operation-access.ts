import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const OPERATION_ACCESS_COOKIE_NAME = 'silla-operation-access-v1';
export const OPERATION_ACCESS_TTL_SECONDS = 12 * 60 * 60;

const TOKEN_VERSION = 'v1';
const LEGACY_EXPOSED_OPERATION_PASSWORD = 'a34349900';
const MIN_PASSWORD_LENGTH = 16;
const MIN_SECRET_LENGTH = 32;

function operationAccessConfig(): { password: string; secret: string } | null {
  const password = process.env.SILLA_OPERATION_PASSWORD?.trim() ?? '';
  const secret = process.env.SILLA_OPERATION_ACCESS_SECRET?.trim() ?? '';
  if (
    password.length < MIN_PASSWORD_LENGTH
    || !/[a-z]/.test(password)
    || !/[A-Z]/.test(password)
    || !/[0-9]/.test(password)
    || !/[^A-Za-z0-9]/.test(password)
    || password === LEGACY_EXPOSED_OPERATION_PASSWORD
    || secret.length < MIN_SECRET_LENGTH
    || secret === password
  ) {
    return null;
  }
  return { password, secret };
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function isOperationAccessConfigured(): boolean {
  return operationAccessConfig() !== null;
}

export function verifyOperationPassword(value: unknown): boolean {
  const config = operationAccessConfig();
  return Boolean(
    config
    && typeof value === 'string'
    && safeEqual(value.trim(), config.password),
  );
}

export function createOperationAccessToken(now: number = Date.now()): string {
  const config = operationAccessConfig();
  if (!config) throw new Error('Operation access is not configured');
  const expiresAt = now + OPERATION_ACCESS_TTL_SECONDS * 1000;
  const payload = `${TOKEN_VERSION}.${expiresAt}`;
  return `${payload}.${sign(payload, config.secret)}`;
}

export function verifyOperationAccessToken(
  token: string | undefined,
  now: number = Date.now(),
): boolean {
  const config = operationAccessConfig();
  if (!config) return false;
  if (!token) return false;
  const [version, rawExpiresAt, signature, ...extra] = token.split('.');
  if (version !== TOKEN_VERSION || !rawExpiresAt || !signature || extra.length > 0) return false;

  const expiresAt = Number(rawExpiresAt);
  if (!Number.isSafeInteger(expiresAt)) return false;
  if (expiresAt <= now || expiresAt > now + OPERATION_ACCESS_TTL_SECONDS * 1000) return false;

  const payload = `${version}.${rawExpiresAt}`;
  return safeEqual(signature, sign(payload, config.secret));
}
