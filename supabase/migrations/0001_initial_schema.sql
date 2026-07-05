-- Wohnungsplanung: initial schema
-- Two-person household app (Jan & Sophie). All data is shared between the
-- two members; RLS restricts everything to the two seeded profiles.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  accent_color text not null,
  created_at timestamptz not null default now()
);

-- Membership check used by every policy. SECURITY DEFINER so it can read
-- profiles without recursing into its own RLS policy.
create or replace function public.is_member()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null default 'shopping-basket',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_path text,
  instructions text not null default '',
  tags text[] not null default '{}',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text,
  sort_order int not null default 0
);

create table public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity numeric,
  unit text,
  category_id uuid references public.categories(id) on delete set null,
  added_by uuid not null references public.profiles(id),
  is_checked boolean not null default false,
  checked_at timestamptz,
  from_recipe_id uuid references public.recipes(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  paid_by uuid not null references public.profiles(id),
  split_type text not null default '50_50' check (split_type in ('50_50','custom','full')),
  -- split_details: {"<profile_id>": <amount owed by that profile>, ...}
  split_details jsonb,
  receipt_path text,
  note text,
  created_at timestamptz not null default now()
);

create table public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  name text not null,
  quantity numeric,
  unit text
);

create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity numeric not null default 0,
  unit text,
  low_stock boolean not null default false,
  updated_at timestamptz not null default now()
);
create unique index pantry_items_name_key on public.pantry_items (lower(name));

create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  amount numeric(10,2) not null check (amount > 0),
  from_profile uuid not null references public.profiles(id),
  to_profile uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  check (from_profile <> to_profile)
);

create table public.cooking_log (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  cooked_by uuid not null references public.profiles(id),
  cooked_at timestamptz not null default now()
);

create table public.week_plan (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  plan_date date not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (recipe_id, plan_date)
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pantry_items_touch
  before update on public.pantry_items
  for each row execute function public.touch_updated_at();

-- RLS: everything readable/writable only by household members.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.shopping_items enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.pantry_items enable row level security;
alter table public.settlements enable row level security;
alter table public.cooking_log enable row level security;
alter table public.week_plan enable row level security;

create policy "members read profiles" on public.profiles
  for select using (public.is_member());

create policy "members all categories" on public.categories
  for all using (public.is_member()) with check (public.is_member());
create policy "members all recipes" on public.recipes
  for all using (public.is_member()) with check (public.is_member());
create policy "members all recipe_ingredients" on public.recipe_ingredients
  for all using (public.is_member()) with check (public.is_member());
create policy "members all shopping_items" on public.shopping_items
  for all using (public.is_member()) with check (public.is_member());
create policy "members all purchases" on public.purchases
  for all using (public.is_member()) with check (public.is_member());
create policy "members all purchase_items" on public.purchase_items
  for all using (public.is_member()) with check (public.is_member());
create policy "members all pantry_items" on public.pantry_items
  for all using (public.is_member()) with check (public.is_member());
create policy "members all settlements" on public.settlements
  for all using (public.is_member()) with check (public.is_member());
create policy "members all cooking_log" on public.cooking_log
  for all using (public.is_member()) with check (public.is_member());
create policy "members all week_plan" on public.week_plan
  for all using (public.is_member()) with check (public.is_member());

-- Storage: private buckets for receipts and recipe photos.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false), ('recipes', 'recipes', false);

create policy "members all storage objects" on storage.objects
  for all using (bucket_id in ('receipts', 'recipes') and public.is_member())
  with check (bucket_id in ('receipts', 'recipes') and public.is_member());

-- Realtime for collaborative lists
alter publication supabase_realtime add table public.shopping_items;
alter publication supabase_realtime add table public.pantry_items;

-- Default shopping categories (Supermarkt-Gänge)
insert into public.categories (name, icon, sort_order) values
  ('Obst & Gemüse', 'carrot', 10),
  ('Backwaren', 'croissant', 20),
  ('Milchprodukte', 'milk', 30),
  ('Fleisch & Fisch', 'beef', 40),
  ('Tiefkühl', 'snowflake', 50),
  ('Vorratsschrank', 'package', 60),
  ('Getränke', 'cup-soda', 70),
  ('Drogerie', 'sparkles', 80),
  ('Haushalt', 'home', 90),
  ('Sonstiges', 'shopping-basket', 100);
