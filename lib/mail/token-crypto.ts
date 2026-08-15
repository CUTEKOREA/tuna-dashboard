import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export type MailProvider = 'gmail' | 'outlook';
export type MailTokenKind = 'access' | 'refresh' | 'pkce';

export interface TokenEncryptionContext {
  userId: string;
  provider: MailProvider;
  tokenKind: MailTokenKind;
}

const VERSION = 'v1';
const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;

function decodeKey(encodedKey: string): Buffer {
  const key = Buffer.from(encodedKey, 'base64');
  if (key.length !== 32 || key.toString('base64') !== encodedKey) {
    throw new Error('메일 토큰 암호화 키는 base64 형식의 32바이트여야 합니다');
  }
  return key;
}

function associatedData(context: TokenEncryptionContext): Buffer {
  return Buffer.from(JSON.stringify([
    'mail-oauth-token',
    VERSION,
    context.userId,
    context.provider,
    context.tokenKind,
  ]));
}

function decodeCanonicalBase64Url(value: string): Buffer {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error('invalid payload');
  const decoded = Buffer.from(value, 'base64url');
  if (decoded.toString('base64url') !== value) throw new Error('invalid payload');
  return decoded;
}

export function encryptToken(
  plaintext: string,
  context: TokenEncryptionContext,
  encodedKey: string,
): string {
  const key = decodeKey(encodedKey);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(associatedData(context));
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [VERSION, iv, authTag, ciphertext]
    .map((part) => typeof part === 'string' ? part : part.toString('base64url'))
    .join('.');
}

export function decryptToken(
  payload: string,
  context: TokenEncryptionContext,
  encodedKey: string,
): string {
  try {
    const key = decodeKey(encodedKey);
    const [version, ivValue, authTagValue, ciphertextValue, extra] = payload.split('.');
    if (version !== VERSION || !ivValue || !authTagValue || !ciphertextValue || extra) {
      throw new Error('invalid payload');
    }

    const iv = decodeCanonicalBase64Url(ivValue);
    const authTag = decodeCanonicalBase64Url(authTagValue);
    const ciphertext = decodeCanonicalBase64Url(ciphertextValue);
    if (iv.length !== IV_BYTES || authTag.length !== 16 || ciphertext.length === 0) {
      throw new Error('invalid payload');
    }

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(associatedData(context));
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plaintext.toString('utf8');
  } catch (error) {
    if (error instanceof Error && error.message.includes('32바이트')) throw error;
    throw new Error('토큰 복호화에 실패했습니다');
  }
}
