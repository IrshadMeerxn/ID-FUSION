-- Run this in your Supabase SQL editor

create table if not exists credentials (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'general', 'rto', 'passport', 'voter')),
  created_at timestamptz default now()
);

create table if not exists persons (
  person_id text primary key,
  name text not null,
  date_of_birth text not null,
  address text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cards (
  id uuid primary key default gen_random_uuid(),
  person_id text references persons(person_id) on delete cascade,
  card_type text not null check (card_type in ('aadhaarCard','panCard','rationCard','voterID','drivingLicense','rcCard','passport')),
  card_number text not null,
  photo_front_url text,
  photo_back_url text,
  unique(person_id, card_type)
);

-- Storage bucket for card photos (run in Supabase dashboard > Storage)
-- Create a public bucket named: card-photos

-- Seed the admin credential (username: Irshad, password: Irshad1327)
insert into credentials (username, password_hash, role)
values ('Irshad', '$2a$10$4OqZ6n34VD5Lkl9RcxS.pOpfH95XBwU5y6uh90X1HHObpkiEQ3H5C', 'admin')
on conflict (username) do nothing;
