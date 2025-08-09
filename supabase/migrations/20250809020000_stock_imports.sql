-- Table for tracking stock imports
create table public.stock_imports (
  id bigserial primary key,
  import_date date not null,
  supplier text not null,
  bl_number text not null,
  created_at timestamptz default now()
);

alter table public.stock_imports enable row level security;

create policy "stock_imports_admin_all" on public.stock_imports
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');
