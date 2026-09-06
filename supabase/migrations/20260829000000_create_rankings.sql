create table public.rankings (
  id uuid primary key default gen_random_uuid(),
  nickname varchar(12) not null,
  score integer not null,
  created_at timestamptz not null default now(),
  constraint rankings_nickname_length check (char_length(nickname) between 1 and 12),
  constraint rankings_nickname_trimmed check (nickname = btrim(nickname)),
  constraint rankings_score_range check (score between 0 and 100000000)
);

create index rankings_score_created_at_idx on public.rankings (score desc, created_at asc);

alter table public.rankings enable row level security;

revoke all on table public.rankings from anon, authenticated;
grant select (id, nickname, score, created_at) on table public.rankings to anon, authenticated;
grant insert (nickname, score) on table public.rankings to anon, authenticated;

create policy "Anyone can read rankings"
on public.rankings for select
to anon, authenticated
using (true);

create policy "Anyone can submit rankings"
on public.rankings for insert
to anon, authenticated
with check (
  char_length(nickname) between 1 and 12
  and nickname = btrim(nickname)
  and score between 0 and 100000000
);