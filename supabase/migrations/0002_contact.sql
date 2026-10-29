-- General enquiries from the Contact page. Inserted by the service role only.
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  topic text not null check (topic in ('membership','pricing','partnership','press','support','other')),
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table contact_messages enable row level security;
-- no policies: no public reads or writes; API route uses the service role.
