-- Commission settings and custom rules
create table public.commission_settings (
  level int primary key,
  rate numeric(5,4) not null,
  active boolean default true
);

create table public.custom_commission_rules (
  id bigserial primary key,
  referrer_id uuid references public.profiles(id) not null,
  level int not null,
  rate numeric(5,4) not null,
  start_at timestamptz not null,
  end_at timestamptz
);

create index custom_commission_rules_referrer_level on public.custom_commission_rules(referrer_id, level);
