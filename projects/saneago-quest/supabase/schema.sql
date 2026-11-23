-- Schema SQL pronto para futura integração com Supabase (PostgreSQL + RLS)
-- Compatível com a estrutura UserProgress em src/types/quiz.ts

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null default 1,
  xp integer not null default 0 check (xp >= 0),
  daily_xp integer not null default 0 check (daily_xp >= 0),
  daily_xp_date date not null default current_date,
  daily_goal_xp integer not null default 60,
  hearts integer not null default 5 check (hearts between 0 and 5),
  streak integer not null default 0 check (streak >= 0),
  last_study_date date,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completions integer not null default 1,
  best_accuracy numeric(5,2) not null default 100,
  last_completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.mistake_bank (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  wrong_count integer not null default 1,
  last_wrong_at timestamptz not null default now(),
  unique (user_id, question_id)
);

create table if not exists public.simulado_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope text not null,
  score integer not null,
  total integer not null,
  accuracy numeric(5,2) not null,
  duration_seconds integer not null,
  completed_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.mistake_bank enable row level security;
alter table public.simulado_attempts enable row level security;

create policy "Usuário gerencia próprio progresso"
  on public.user_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuário gerencia próprias lições"
  on public.lesson_completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuário gerencia próprio banco de erros"
  on public.mistake_bank for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuário gerencia próprios simulados"
  on public.simulado_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
