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

create table if not exists wedding_rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_name varchar(120) not null,
  attending boolean not null,
  party_size smallint not null default 1 check (party_size between 0 and 4),
  client_submission_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table wedding_rsvps add column if not exists party_size smallint;
update wedding_rsvps
  set party_size = case when attending then 1 else 0 end
  where party_size is null;
alter table wedding_rsvps alter column party_size set default 1;
alter table wedding_rsvps alter column party_size set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'wedding_rsvps_party_size_check'
      and conrelid = 'wedding_rsvps'::regclass
  ) then
    alter table wedding_rsvps
      add constraint wedding_rsvps_party_size_check check (party_size between 0 and 4);
  end if;
end $$;

create index if not exists wedding_rsvps_attending_created_at_idx
  on wedding_rsvps (attending, created_at desc);
