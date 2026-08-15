import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServiceConfig } from './server-env';

export function createMailServiceClient(): SupabaseClient {
  const { url, serviceRoleKey } = getSupabaseServiceConfig();
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
