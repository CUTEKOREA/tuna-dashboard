import type { SupabaseClient } from '@supabase/supabase-js';
import { decryptToken, encryptToken, type MailProvider } from './token-crypto';

export interface BuildMailConnectionInput {
  userId: string;
  provider: MailProvider;
  providerEmail: string;
  providerAccountId: string;
  refreshToken: string;
  grantedScopes: string[];
  encryptionKey: string;
}

export interface MailConnectionRecord {
  user_id: string;
  provider: MailProvider;
  provider_email: string;
  provider_account_id: string;
  refresh_token_ciphertext: string;
  granted_scopes: string[];
  connected_at: string;
  updated_at: string;
}

export interface MailConnectionSummary {
  provider: MailProvider;
  provider_email: string;
  connected_at: string;
  updated_at: string;
}

export function buildMailConnectionRecord(input: BuildMailConnectionInput): MailConnectionRecord {
  const now = new Date().toISOString();
  return {
    user_id: input.userId,
    provider: input.provider,
    provider_email: input.providerEmail.trim().toLowerCase(),
    provider_account_id: input.providerAccountId,
    refresh_token_ciphertext: encryptToken(
      input.refreshToken,
      { userId: input.userId, provider: input.provider, tokenKind: 'refresh' },
      input.encryptionKey,
    ),
    granted_scopes: [...new Set(input.grantedScopes)].sort(),
    connected_at: now,
    updated_at: now,
  };
}

export async function saveMailConnection(
  client: SupabaseClient,
  input: BuildMailConnectionInput,
): Promise<void> {
  const record = buildMailConnectionRecord(input);
  const { error } = await client
    .from('mail_oauth_connections')
    .insert(record);
  if (error) throw new Error('메일 연결 정보를 저장하지 못했습니다');
}

export async function getMailConnection(
  client: SupabaseClient,
  userId: string,
  provider: MailProvider,
): Promise<MailConnectionRecord | null> {
  const { data, error } = await client
    .from('mail_oauth_connections')
    .select('user_id, provider, provider_email, provider_account_id, refresh_token_ciphertext, granted_scopes, connected_at, updated_at')
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle();
  if (error) throw new Error('메일 연결 정보를 조회하지 못했습니다');
  return data as MailConnectionRecord | null;
}

export async function getMailConnectionSummary(
  client: SupabaseClient,
  userId: string,
  provider: MailProvider,
): Promise<MailConnectionSummary | null> {
  const { data, error } = await client
    .from('mail_oauth_connections')
    .select('provider, provider_email, connected_at, updated_at')
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle();
  if (error) throw new Error('메일 연결 상태를 조회하지 못했습니다');
  return data as MailConnectionSummary | null;
}

export function readRefreshToken(record: MailConnectionRecord, encryptionKey: string): string {
  return decryptToken(
    record.refresh_token_ciphertext,
    { userId: record.user_id, provider: record.provider, tokenKind: 'refresh' },
    encryptionKey,
  );
}

export async function deleteMailConnection(
  client: SupabaseClient,
  userId: string,
  provider: MailProvider,
): Promise<void> {
  const { error } = await client
    .from('mail_oauth_connections')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);
  if (error) throw new Error('메일 연결 정보를 삭제하지 못했습니다');
}
