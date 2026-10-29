-- Pickle — initial schema. Mirrors lib/types. Row Level Security is on for every table.
-- No table stores raw payment credentials: cards are referenced by provider id and last four only.

create extension if not exists "pgcrypto";

create type perk_category as enum ('pool-beach','bars-clubs','dining','family','spa-fitness');
create type perk_status as enum ('conceptual','available','expired');
create type tier_id as enum ('green','black','reserve');
create type merchant_status as enum ('demo','approved','pending');
create type campaign_status as enum ('draft','scheduled','live-demo','ended');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Member',
  country text,
  currency text default 'USD',
  card_design tier_id not null default 'green',
  created_at timestamptz not null default now()
);

create table membership_tiers (
  id tier_id primary key,
  name text not null,
  tagline text not null,
  description text not null,
  benefits text[] not null default '{}',
  status text not null default 'proposed'
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  tier tier_id not null default 'green',
  started_at timestamptz not null default now(),
  unique (profile_id)
);

create table merchants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  name text not null,
  description text not null default '',
  category perk_category not null,
  status merchant_status not null default 'pending',
  mark text not null default '',
  created_at timestamptz not null default now()
);

create table merchant_locations (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  address text not null,
  neighbourhood text not null,
  city text not null,
  country text not null,
  lat double precision,
  lng double precision
);

create table perks (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  title text not null,
  description text not null,
  category perk_category not null,
  terms text not null,
  eligibility text not null,
  tier tier_id not null default 'green',
  start_at date not null,
  expires_at date,
  status perk_status not null default 'conceptual',
  featured boolean not null default false,
  redemption_limit integer check (redemption_limit is null or redemption_limit > 0),
  created_at timestamptz not null default now(),
  check (expires_at is null or expires_at >= start_at)
);

create table saved_perks (
  profile_id uuid not null references profiles(id) on delete cascade,
  perk_id uuid not null references perks(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (profile_id, perk_id)
);

create table perk_redemptions (
  id uuid primary key default gen_random_uuid(),
  perk_id uuid not null references perks(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  -- redemptions are created server-side from verified transaction events only
  source_event_id text unique,
  redeemed_at timestamptz not null default now()
);

create table waitlist (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  email text not null,
  country text not null,
  interest text not null,
  card_style tier_id,
  consent boolean not null default false check (consent),
  created_at timestamptz not null default now()
);
create unique index waitlist_email_unique on waitlist (lower(email));

create table merchant_applications (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text not null,
  email text not null,
  city text not null,
  country text not null,
  category perk_category not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create unique index merchant_applications_unique on merchant_applications (lower(email), lower(business_name));

create table group_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  planned_for date,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create table group_plan_perks (
  plan_id uuid not null references group_plans(id) on delete cascade,
  perk_id uuid not null references perks(id) on delete cascade,
  primary key (plan_id, perk_id)
);

create table activity_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  -- provider event id; unique so duplicate webhook deliveries are rejected at the database
  source_event_id text not null unique,
  merchant_label text not null,
  amount numeric(12,2) not null,
  currency text not null,
  category perk_category,
  status text not null,
  related_perk_id uuid references perks(id) on delete set null,
  occurred_at timestamptz not null,
  simulated boolean not null default true
);

-- Row Level Security -------------------------------------------------------
alter table profiles enable row level security;
alter table membership_tiers enable row level security;
alter table memberships enable row level security;
alter table merchants enable row level security;
alter table merchant_locations enable row level security;
alter table perks enable row level security;
alter table saved_perks enable row level security;
alter table perk_redemptions enable row level security;
alter table waitlist enable row level security;
alter table merchant_applications enable row level security;
alter table group_plans enable row level security;
alter table group_plan_perks enable row level security;
alter table activity_events enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "tiers are public" on membership_tiers for select using (true);
create policy "own membership" on memberships for select using (auth.uid() = profile_id);
create policy "approved merchants are public" on merchants for select using (status in ('approved','demo') or owner_id = auth.uid());
create policy "merchant owner edits" on merchants for update using (owner_id = auth.uid());
create policy "locations follow merchant" on merchant_locations for select using (exists (select 1 from merchants m where m.id = merchant_id and (m.status in ('approved','demo') or m.owner_id = auth.uid())));
create policy "available perks are public" on perks for select using (status <> 'conceptual' or exists (select 1 from merchants m where m.id = merchant_id and m.owner_id = auth.uid()));
create policy "merchant owner manages perks" on perks for all using (exists (select 1 from merchants m where m.id = merchant_id and m.owner_id = auth.uid()));
create policy "own saved perks" on saved_perks for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "own redemptions readable" on perk_redemptions for select using (auth.uid() = profile_id);
-- waitlist and applications: inserts only through the service role (API routes); no public reads.
create policy "own plans" on group_plans for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "own plan perks" on group_plan_perks for all using (exists (select 1 from group_plans p where p.id = plan_id and p.owner_id = auth.uid()));
create policy "own activity readable" on activity_events for select using (auth.uid() = profile_id);

insert into membership_tiers (id, name, tagline, description, benefits) values
 ('green','Pickle Green','The everyday membership.','Proposed entry tier.', array['Everyday Pickle Perks','Pickle Radar and saved perks','Pickle Together plans','Green card design']),
 ('black','Pickle Black','More of the good stuff.','Proposed mid tier.', array['Everything in Pickle Green','Dining and hotel extras','Members'' previews and lounges','Black card design']),
 ('reserve','Pickle Reserve','The quiet upgrades.','Proposed top tier.', array['Everything in Pickle Black','Priority access and upgrades','Guest-list perks','Reserve card design','Dedicated member support']);
