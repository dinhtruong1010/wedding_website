create table if not exists wedding_config (
  version text not null,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (version, key)
);
