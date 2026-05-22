-- Kung Fu Mandarin MVP (HSK1 only)
-- Schema inicial: conteúdo (vocab), exemplos, progresso, SRS e histórico de tentativas

-- Enable extensions
create extension if not exists pgcrypto;

-- 1) Conteúdo
create table if not exists public.hsk_items (
  id uuid primary key default gen_random_uuid(),
  hsk_level int not null check (hsk_level = 1),
  hanzi text not null,
  pinyin text not null,
  pt text not null, -- "professor; professora" etc.
  tags text[] not null default '{}',
  dojo_context text, -- mini contexto narrativo (1-2 linhas)
  created_at timestamptz not null default now()
);

create unique index if not exists hsk_items_unique on public.hsk_items (hanzi, pinyin);

create table if not exists public.hsk_examples (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.hsk_items(id) on delete cascade,
  example_hanzi text not null,
  example_pinyin text not null,
  example_pt text not null,
  difficulty int not null default 1,
  created_at timestamptz not null default now()
);

-- 2) Perfil e progresso (por usuário)
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  xp int not null default 0,
  level int not null default 1,
  streak int not null default 0,
  last_active_date date,
  created_at timestamptz not null default now()
);

-- 3) SRS (por item)
-- Leituras:
-- - strength: 0..1 (domínio)
-- - next_review_at: quando revisar
create table if not exists public.user_srs (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.hsk_items(id) on delete cascade,
  strength real not null default 0,
  last_result text, -- correct/incorrect
  last_review_at timestamptz,
  next_review_at timestamptz,
  lapses int not null default 0,
  correct_streak int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- 4) Histórico de tentativas (para analytics e “caderno de erros”)
create table if not exists public.user_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid references public.hsk_items(id) on delete set null,
  activity_type text not null, -- pt_to_zh | zh_to_pt | cloze | match | pinyin_to_hanzi
  prompt text not null,
  user_answer text,
  is_correct boolean not null,
  feedback jsonb,
  created_at timestamptz not null default now()
);

-- RLS (simplificado para MVP)
alter table public.user_profiles enable row level security;
alter table public.user_srs enable row level security;
alter table public.user_attempts enable row level security;

create policy "profiles own" on public.user_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "srs own" on public.user_srs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "attempts own" on public.user_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Conteúdo público (somente leitura)
alter table public.hsk_items enable row level security;
alter table public.hsk_examples enable row level security;

create policy "items read" on public.hsk_items
  for select using (true);

create policy "examples read" on public.hsk_examples
  for select using (true);
