create table if not exists public.mail_oauth_connections (
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('gmail', 'outlook')),
  provider_email text not null,
  provider_account_id text not null,
  refresh_token_ciphertext text not null,
  granted_scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, provider)
);

alter table public.mail_oauth_connections enable row level security;

revoke all on public.mail_oauth_connections from public;
revoke all on public.mail_oauth_connections from anon, authenticated;
grant select, insert, update, delete on public.mail_oauth_connections to service_role;

comment on table public.mail_oauth_connections is
  '서버 전용 OAuth 갱신 토큰 저장소. 평문 토큰·메일 본문·첨부파일 저장 금지.';
