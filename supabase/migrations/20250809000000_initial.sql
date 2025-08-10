-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Custom types
create type user_role as enum ('client','advisor','admin');
create type gender as enum ('male','female','unisex');
create type season as enum ('spring','summer','autumn','winter','all');
create type promotion_type as enum ('discount','two_plus_one','pack');

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role user_role not null default 'client',
  first_name text,
  last_name text,
  phone text unique,
  birth_date date,
  address text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select" on public.profiles
  for select
  using (
    auth.uid() = id or current_setting('request.jwt.claim.role', true) = 'admin'
  );

create policy "profiles_insert" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update
  using (
    auth.uid() = id or current_setting('request.jwt.claim.role', true) = 'admin'
  )
  with check (
    auth.uid() = id or current_setting('request.jwt.claim.role', true) = 'admin'
  );

create policy "profiles_delete" on public.profiles
  for delete
  using (current_setting('request.jwt.claim.role', true) = 'admin');

-- Products table
create table public.products (
  id bigserial primary key,
  product_code text not null unique,
  inspired_name text not null,
  inspired_brand text not null,
  gender gender,
  season season,
  olfactory_family text,
  top_notes text[],
  heart_notes text[],
  base_notes text[],
  description text,
  image_url text,
  active boolean not null default true
);

create index products_inspired_name_idx on public.products using gin (to_tsvector('simple', inspired_name));
create index products_inspired_brand_idx on public.products using gin (to_tsvector('simple', inspired_brand));
create index products_notes_idx on public.products using gin (top_notes, heart_notes, base_notes);

alter table public.products enable row level security;

create policy "products_select" on public.products
  for select
  using (active);

create policy "products_admin_all" on public.products
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Product variants table
create table public.product_variants (
  id bigserial primary key,
  variant_code text not null unique,
  product_id bigint references public.products on delete cascade,
  volume_ml integer not null check (volume_ml in (15,30,50,100)),
  price_tnd numeric(10,2) not null,
  cost_tnd numeric(10,2) not null,
  stock_qty integer not null default 0,
  stock_min integer not null default 0,
  updated_at timestamptz not null default now()
);

create index product_variants_product_id_idx on public.product_variants(product_id);

alter table public.product_variants enable row level security;

create policy "product_variants_select" on public.product_variants
  for select
  using (true);

create policy "product_variants_admin_all" on public.product_variants
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Carts table
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index carts_user_id_key on public.carts(user_id);

alter table public.carts enable row level security;

create policy "carts_user_all" on public.carts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "carts_admin_all" on public.carts
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Cart items table
create table public.cart_items (
  id bigserial primary key,
  cart_id uuid references public.carts on delete cascade,
  product_variant_id bigint references public.product_variants on delete cascade,
  qty integer not null default 1,
  inserted_at timestamptz default now()
);

create unique index cart_items_cart_variant_key on public.cart_items(cart_id, product_variant_id);

alter table public.cart_items enable row level security;

create policy "cart_items_user_all" on public.cart_items
  for all
  using (
    auth.uid() in (select user_id from public.carts where id = cart_id)
  )
  with check (
    auth.uid() in (select user_id from public.carts where id = cart_id)
  );

create policy "cart_items_admin_all" on public.cart_items
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Orders table
create table public.orders (
  id bigserial primary key,
  order_code text not null unique,
  user_id uuid references public.profiles on delete set null,
  advisor_id uuid references public.profiles on delete set null,
  total_tnd numeric(10,2) not null default 0,
  created_at timestamptz default now()
);

create index orders_user_id_idx on public.orders(user_id);
create index orders_advisor_id_idx on public.orders(advisor_id);

alter table public.orders enable row level security;

create policy "orders_client_select" on public.orders
  for select
  using (auth.uid() = user_id);

create policy "orders_advisor_select" on public.orders
  for select
  using (auth.uid() = advisor_id);

create policy "orders_client_insert" on public.orders
  for insert
  with check (auth.uid() = user_id);

create policy "orders_advisor_insert" on public.orders
  for insert
  with check (auth.uid() = advisor_id);

create policy "orders_client_update" on public.orders
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "orders_advisor_update" on public.orders
  for update
  using (auth.uid() = advisor_id)
  with check (auth.uid() = advisor_id);

create policy "orders_admin_all" on public.orders
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Order items table
create table public.order_items (
  id bigserial primary key,
  order_id bigint references public.orders on delete cascade,
  product_variant_id bigint references public.product_variants on delete restrict,
  qty integer not null,
  unit_price_tnd numeric(10,2) not null,
  discount_tnd numeric(10,2) not null default 0,
  total_line_tnd numeric(10,2) not null
);

create index order_items_order_id_idx on public.order_items(order_id);

alter table public.order_items enable row level security;

create policy "order_items_access" on public.order_items
  for all
  using (
    auth.uid() in (
      select user_id from public.orders where id = order_id
      union
      select advisor_id from public.orders where id = order_id
    )
    or current_setting('request.jwt.claim.role', true) = 'admin'
  )
  with check (
    auth.uid() in (
      select user_id from public.orders where id = order_id
      union
      select advisor_id from public.orders where id = order_id
    )
    or current_setting('request.jwt.claim.role', true) = 'admin'
  );

-- Promotions table
create table public.promotions (
  id bigserial primary key,
  type promotion_type not null,
  condition_json jsonb not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true
);

create index promotions_active_idx on public.promotions(active);
create index promotions_period_idx on public.promotions(starts_at, ends_at);

alter table public.promotions enable row level security;

create policy "promotions_select" on public.promotions
  for select
  using (active and now() between starts_at and ends_at);

create policy "promotions_admin_all" on public.promotions
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Commissions table
create table public.commissions (
  id bigserial primary key,
  referrer_id uuid references public.profiles on delete set null,
  referee_id uuid references public.profiles on delete set null,
  order_id bigint references public.orders on delete cascade,
  level smallint not null check (level between 1 and 3),
  amount_tnd numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create index commissions_referrer_id_idx on public.commissions(referrer_id);
create index commissions_order_id_idx on public.commissions(order_id);

alter table public.commissions enable row level security;

create policy "commissions_select" on public.commissions
  for select
  using (auth.uid() = referrer_id or current_setting('request.jwt.claim.role', true) = 'admin');

create policy "commissions_admin_all" on public.commissions
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Commission payments table
create table public.commission_payments (
  id bigserial primary key,
  payee_id uuid references public.profiles on delete set null,
  amount_tnd numeric(10,2) not null,
  paid_at timestamptz default now()
);

create index commission_payments_payee_id_idx on public.commission_payments(payee_id);

alter table public.commission_payments enable row level security;

create policy "commission_payments_select" on public.commission_payments
  for select
  using (auth.uid() = payee_id or current_setting('request.jwt.claim.role', true) = 'admin');

create policy "commission_payments_admin_all" on public.commission_payments
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Commission payment items table
create table public.commission_payment_items (
  id bigserial primary key,
  commission_id bigint references public.commissions on delete cascade,
  payment_id bigint references public.commission_payments on delete cascade,
  amount_tnd numeric(10,2) not null,
  created_at timestamptz default now(),
  unique (commission_id)
);

create index commission_payment_items_payment_id_idx on public.commission_payment_items(payment_id);

alter table public.commission_payment_items enable row level security;

create policy "commission_payment_items_select" on public.commission_payment_items
  for select
  using (
    auth.uid() in (
      select referrer_id from public.commissions where id = commission_id
      union
      select payee_id from public.commission_payments where id = payment_id
    )
    or current_setting('request.jwt.claim.role', true) = 'admin'
  );

create policy "commission_payment_items_admin_all" on public.commission_payment_items
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Notifications table
create table public.notifications (
  id bigserial primary key,
  user_id uuid references public.profiles on delete cascade,
  type text not null,
  payload jsonb not null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_read_at_idx on public.notifications(read_at);

alter table public.notifications enable row level security;

create policy "notifications_user_all" on public.notifications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notifications_admin_all" on public.notifications
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- Admin settings table
create table public.admin_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table public.admin_settings enable row level security;

create policy "admin_settings_admin_all" on public.admin_settings
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

-- User logs table
create table public.user_logs (
  id bigserial primary key,
  user_id uuid references public.profiles on delete set null,
  action text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index user_logs_user_id_idx on public.user_logs(user_id);

alter table public.user_logs enable row level security;

create policy "user_logs_select" on public.user_logs
  for select
  using (auth.uid() = user_id or current_setting('request.jwt.claim.role', true) = 'admin');

create policy "user_logs_admin_all" on public.user_logs
  for all
  using (current_setting('request.jwt.claim.role', true) = 'admin')
  with check (current_setting('request.jwt.claim.role', true) = 'admin');

