-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null default '',
  avatar_url text,
  purchase_tier text not null default 'free' check (purchase_tier in ('free', 'lifetime')),
  style_goals text[] not null default '{}',
  style_profile jsonb not null default '{}',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Garments table
create table public.garments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null default '',
  type text not null,
  subtype text not null,
  colors jsonb not null default '[]',
  pattern text not null default 'solid',
  formality integer not null default 3 check (formality >= 1 and formality <= 5),
  season text[] not null default '{}',
  material text not null default 'cotton',
  image_url text not null,
  processed_image_url text not null default '',
  three_d_template_id text not null default '',
  wear_count integer not null default 0,
  last_worn_at timestamptz,
  created_at timestamptz not null default now()
);

-- Outfits table
create table public.outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  name text not null default '',
  garment_ids uuid[] not null default '{}',
  source text not null default 'ai_suggested' check (source in ('ai_suggested', 'user_created')),
  ai_score numeric(3,1) not null default 0,
  ai_comment text not null default '',
  color_harmony_score numeric(3,1) not null default 0,
  style_match_score numeric(3,1) not null default 0,
  proportion_score numeric(3,1) not null default 0,
  user_rating numeric(3,1),
  occasion_tags text[] not null default '{}',
  favorited boolean not null default false,
  created_at timestamptz not null default now()
);

-- Shopping suggestions table
create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  type text not null check (type in ('gap_fill', 'trend', 'versatility')),
  garment_type text not null,
  recommended_colors text[] not null default '{}',
  reason text not null,
  outfits_unlocked integer not null default 0,
  affiliate_url text,
  status text not null default 'active' check (status in ('active', 'dismissed', 'purchased')),
  created_at timestamptz not null default now()
);

-- Style interactions table (for personalization)
create table public.style_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade not null,
  type text not null check (type in ('outfit_rated', 'suggestion_dismissed', 'outfit_favorited', 'garment_worn')),
  reference_id uuid not null,
  value text not null default '',
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- Indexes
create index garments_user_id_idx on public.garments(user_id);
create index outfits_user_id_idx on public.outfits(user_id);
create index suggestions_user_id_idx on public.suggestions(user_id);
create index style_interactions_user_id_idx on public.style_interactions(user_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.garments enable row level security;
alter table public.outfits enable row level security;
alter table public.suggestions enable row level security;
alter table public.style_interactions enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can view own garments" on public.garments for select using (auth.uid() = user_id);
create policy "Users can insert own garments" on public.garments for insert with check (auth.uid() = user_id);
create policy "Users can update own garments" on public.garments for update using (auth.uid() = user_id);
create policy "Users can delete own garments" on public.garments for delete using (auth.uid() = user_id);
create policy "Users can view own outfits" on public.outfits for select using (auth.uid() = user_id);
create policy "Users can insert own outfits" on public.outfits for insert with check (auth.uid() = user_id);
create policy "Users can update own outfits" on public.outfits for update using (auth.uid() = user_id);
create policy "Users can delete own outfits" on public.outfits for delete using (auth.uid() = user_id);
create policy "Users can view own suggestions" on public.suggestions for select using (auth.uid() = user_id);
create policy "Users can insert own suggestions" on public.suggestions for insert with check (auth.uid() = user_id);
create policy "Users can update own suggestions" on public.suggestions for update using (auth.uid() = user_id);
create policy "Users can view own interactions" on public.style_interactions for select using (auth.uid() = user_id);
create policy "Users can insert own interactions" on public.style_interactions for insert with check (auth.uid() = user_id);

-- Function: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: run on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
