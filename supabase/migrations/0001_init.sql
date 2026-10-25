-- Stage 2: searches and the leads they returned.
-- Owners (user_id) and per-user RLS policies arrive with auth in stage 3.

create table public.searches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  keyword text not null,
  city text not null,
  source text not null check (source in ('google', 'outscraper', 'mock')),
  preset text not null,
  result_count integer not null default 0
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  search_id uuid not null references public.searches (id) on delete cascade,
  created_at timestamptz not null default now(),
  source text not null,
  source_id text not null,
  name text not null,
  category text,
  address text,
  city text,
  phone text,
  website text,
  rating numeric(2, 1),
  review_count integer,
  maps_url text,
  lat double precision,
  lng double precision,
  is_operational boolean not null default true,
  score integer not null default 0,
  reasons text[] not null default '{}'
);

create index leads_search_id_idx on public.leads (search_id);
create index leads_source_idx on public.leads (source, source_id);

-- No policies yet: only the service role (server) can touch these tables.
alter table public.searches enable row level security;
alter table public.leads enable row level security;
