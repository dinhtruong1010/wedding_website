-- Nghệ An invitation (/na): its own RSVP table in the SAME Neon database as Hà Nội.
-- Wishes are shared: both invitations read and write wedding_wishes.
-- Same structure as wedding_rsvps in schema.sql. Safe to re-run.
-- Run once in the Neon SQL Editor of the database behind DATABASE_URL.

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
