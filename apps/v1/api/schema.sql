create table if not exists wedding_config (
  version text not null,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (version, key)
);

create table if not exists wedding_wishes (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  message varchar(1000) not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists wedding_wishes_published_created_at_idx
  on wedding_wishes (published, created_at desc);
