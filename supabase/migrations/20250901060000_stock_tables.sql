-- Tables for stock management
create table public.variant_stocks (
  product_variant_id bigint primary key references public.product_variants on delete cascade,
  qty integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.variant_stocks enable row level security;

create policy "variant_stocks_admin_all" on public.variant_stocks
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

create table public.stock_import_logs (
  id bigserial primary key,
  import_date date not null,
  supplier text not null,
  bl_number text not null,
  success_count integer not null default 0,
  failure_count integer not null default 0,
  created_at timestamptz default now()
);

alter table public.stock_import_logs enable row level security;

create policy "stock_import_logs_admin_all" on public.stock_import_logs
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

create table public.stock_adjustments (
  id bigserial primary key,
  product_variant_id bigint references public.product_variants on delete cascade,
  qty_delta integer not null,
  stock_import_log_id bigint references public.stock_import_logs on delete set null,
  created_at timestamptz default now()
);

alter table public.stock_adjustments enable row level security;

create policy "stock_adjustments_admin_all" on public.stock_adjustments
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');
