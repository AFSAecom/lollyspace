-- Commission rules table for global and referrer-specific rates
create table public.commission_rules (
  id bigserial primary key,
  level smallint not null,
  rate numeric not null,
  referrer_id uuid references public.profiles(id)
);

-- Ensure only one global rule per level and one per referrer/level combination
create unique index commission_rules_global_unique on public.commission_rules(level) where referrer_id is null;
create unique index commission_rules_referrer_unique on public.commission_rules(level, referrer_id) where referrer_id is not null;

alter table public.commission_rules enable row level security;

create policy "commission_rules_admin_all" on public.commission_rules
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Seed default global commission rates
insert into public.commission_rules(level, rate) values
  (1, 0.1),
  (2, 0.05),
  (3, 0.02);
