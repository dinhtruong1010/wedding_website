-- Nghệ An invitation (/na): its own tables in the SAME Neon database as Hà Nội.
-- Same structure as wedding_wishes / wedding_rsvps in schema.sql. Safe to re-run.
-- Run once in the Neon SQL Editor of the database behind DATABASE_URL.

create table if not exists wedding_wishes_na (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  message varchar(1000) not null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists wedding_wishes_na_published_created_at_idx
  on wedding_wishes_na (published, created_at desc);

create table if not exists wedding_rsvps_na (
  id uuid primary key default gen_random_uuid(),
  guest_name varchar(120) not null,
  attending boolean not null,
  party_size smallint not null default 1 check (party_size between 0 and 4),
  client_submission_id uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wedding_rsvps_na_attending_created_at_idx
  on wedding_rsvps_na (attending, created_at desc);
