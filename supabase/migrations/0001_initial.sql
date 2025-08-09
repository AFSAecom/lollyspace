-- 0001_initial.sql
-- Create core tables, enums, RLS, and seed data for the Lollyspace application

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('client','advisor','admin');
create type order_status as enum ('pending','paid','shipped','completed','cancelled');
create type discount_type as enum ('percentage','fixed');
create type commission_status as enum ('pending','paid');

-- Profiles
create table public.profiles (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    full_name text,
    role user_role not null default 'client',
    created_at timestamptz not null default now()
);

-- Products
create table public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    created_at timestamptz not null default now()
);
create index on public.products (name);

-- Product Variants
create table public.product_variants (
    id uuid primary key default gen_random_uuid(),
    product_id uuid references public.products(id) on delete cascade,
    name text not null,
    sku text unique,
    price numeric(10,2) not null,
    created_at timestamptz not null default now()
);
create index on public.product_variants (product_id);

-- Carts
create table public.carts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade,
    status text default 'open',
    created_at timestamptz not null default now()
);
create index on public.carts (user_id);

-- Cart Items
create table public.cart_items (
    id uuid primary key default gen_random_uuid(),
    cart_id uuid references public.carts(id) on delete cascade,
    product_variant_id uuid references public.product_variants(id) on delete cascade,
    quantity integer not null default 1,
    created_at timestamptz not null default now()
);
create index on public.cart_items (cart_id);
create index on public.cart_items (product_variant_id);

-- Orders
create table public.orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade,
    advisor_id uuid references public.profiles(id),
    status order_status not null default 'pending',
    total_amount numeric(10,2) not null default 0,
    created_at timestamptz not null default now()
);
create index on public.orders (user_id);
create index on public.orders (advisor_id);

-- Order Items
create table public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references public.orders(id) on delete cascade,
    product_variant_id uuid references public.product_variants(id),
    quantity integer not null default 1,
    price numeric(10,2) not null,
    created_at timestamptz not null default now()
);
create index on public.order_items (order_id);

-- Promotions
create table public.promotions (
    id uuid primary key default gen_random_uuid(),
    code text not null unique,
    discount_type discount_type not null,
    discount_value numeric(10,2) not null,
    start_date date,
    end_date date,
    created_at timestamptz not null default now()
);

-- Commissions
create table public.commissions (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references public.orders(id) on delete cascade,
    advisor_id uuid references public.profiles(id),
    amount numeric(10,2) not null,
    status commission_status not null default 'pending',
    created_at timestamptz not null default now()
);
create index on public.commissions (advisor_id);
create index on public.commissions (order_id);

-- Commission Payments
create table public.commission_payments (
    id uuid primary key default gen_random_uuid(),
    advisor_id uuid references public.profiles(id),
    amount numeric(10,2) not null,
    paid_at timestamptz,
    created_at timestamptz not null default now()
);
create index on public.commission_payments (advisor_id);

-- Commission Payment Items
create table public.commission_payment_items (
    id uuid primary key default gen_random_uuid(),
    payment_id uuid references public.commission_payments(id) on delete cascade,
    commission_id uuid references public.commissions(id) on delete cascade,
    amount numeric(10,2) not null,
    created_at timestamptz not null default now()
);
create index on public.commission_payment_items (payment_id);
create index on public.commission_payment_items (commission_id);

-- Notifications
create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade,
    message text not null,
    read boolean not null default false,
    created_at timestamptz not null default now()
);
create index on public.notifications (user_id);

-- Admin Settings
create table public.admin_settings (
    key text primary key,
    value jsonb,
    updated_at timestamptz not null default now()
);

-- User Logs
create table public.user_logs (
    id bigserial primary key,
    user_id uuid references public.profiles(id),
    action text not null,
    metadata jsonb,
    created_at timestamptz not null default now()
);
create index on public.user_logs (user_id);

-- Row Level Security Policies

-- Profiles
alter table public.profiles enable row level security;
create policy "Client profile access" on public.profiles
  for select using (auth.jwt()->>'role' = 'client' and auth.uid() = id)
  with check (auth.jwt()->>'role' = 'client' and auth.uid() = id);
create policy "Advisor profile access" on public.profiles
  for select using (auth.jwt()->>'role' = 'advisor' and auth.uid() = id)
  with check (auth.jwt()->>'role' = 'advisor' and auth.uid() = id);
create policy "Admin manage profiles" on public.profiles
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Products
alter table public.products enable row level security;
create policy "Client read products" on public.products
  for select using (auth.jwt()->>'role' = 'client');
create policy "Advisor read products" on public.products
  for select using (auth.jwt()->>'role' = 'advisor');
create policy "Admin manage products" on public.products
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Product Variants
alter table public.product_variants enable row level security;
create policy "Client read variants" on public.product_variants
  for select using (auth.jwt()->>'role' = 'client');
create policy "Advisor read variants" on public.product_variants
  for select using (auth.jwt()->>'role' = 'advisor');
create policy "Admin manage variants" on public.product_variants
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Carts
alter table public.carts enable row level security;
create policy "Client manage own cart" on public.carts
  for all using (auth.jwt()->>'role' = 'client' and auth.uid() = user_id)
  with check (auth.jwt()->>'role' = 'client' and auth.uid() = user_id);
create policy "Advisor manage own cart" on public.carts
  for all using (auth.jwt()->>'role' = 'advisor' and auth.uid() = user_id)
  with check (auth.jwt()->>'role' = 'advisor' and auth.uid() = user_id);
create policy "Admin manage carts" on public.carts
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Cart Items
alter table public.cart_items enable row level security;
create policy "Client cart items" on public.cart_items
  for all using (auth.jwt()->>'role' = 'client' and exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid()))
  with check (auth.jwt()->>'role' = 'client' and exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid()));
create policy "Advisor cart items" on public.cart_items
  for all using (auth.jwt()->>'role' = 'advisor' and exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid()))
  with check (auth.jwt()->>'role' = 'advisor' and exists (select 1 from public.carts c where c.id = cart_items.cart_id and c.user_id = auth.uid()));
create policy "Admin manage cart items" on public.cart_items
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Orders
alter table public.orders enable row level security;
create policy "Client manage own orders" on public.orders
  for all using (auth.jwt()->>'role' = 'client' and auth.uid() = user_id)
  with check (auth.jwt()->>'role' = 'client' and auth.uid() = user_id);
create policy "Advisor view assigned orders" on public.orders
  for select using (auth.jwt()->>'role' = 'advisor' and auth.uid() = advisor_id);
create policy "Admin manage orders" on public.orders
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Order Items
alter table public.order_items enable row level security;
create policy "Client order items" on public.order_items
  for select using (auth.jwt()->>'role' = 'client' and exists (select 1 from public.orders o where o.id = order_items.order_id and o.user_id = auth.uid()));
create policy "Advisor order items" on public.order_items
  for select using (auth.jwt()->>'role' = 'advisor' and exists (select 1 from public.orders o where o.id = order_items.order_id and o.advisor_id = auth.uid()));
create policy "Admin manage order items" on public.order_items
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Promotions
alter table public.promotions enable row level security;
create policy "Client read promotions" on public.promotions
  for select using (auth.jwt()->>'role' = 'client');
create policy "Advisor read promotions" on public.promotions
  for select using (auth.jwt()->>'role' = 'advisor');
create policy "Admin manage promotions" on public.promotions
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Commissions
alter table public.commissions enable row level security;
create policy "Advisor view own commissions" on public.commissions
  for select using (auth.jwt()->>'role' = 'advisor' and auth.uid() = advisor_id);
create policy "Admin manage commissions" on public.commissions
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Commission Payments
alter table public.commission_payments enable row level security;
create policy "Advisor view own payments" on public.commission_payments
  for select using (auth.jwt()->>'role' = 'advisor' and auth.uid() = advisor_id);
create policy "Admin manage commission payments" on public.commission_payments
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Commission Payment Items
alter table public.commission_payment_items enable row level security;
create policy "Advisor view own payment items" on public.commission_payment_items
  for select using (
    auth.jwt()->>'role' = 'advisor' and
    exists (
      select 1 from public.commission_payments p
      where p.id = commission_payment_items.payment_id
        and p.advisor_id = auth.uid()
    )
  );
create policy "Admin manage payment items" on public.commission_payment_items
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Notifications
alter table public.notifications enable row level security;
create policy "Client notifications" on public.notifications
  for all using (auth.jwt()->>'role' = 'client' and auth.uid() = user_id)
  with check (auth.jwt()->>'role' = 'client' and auth.uid() = user_id);
create policy "Advisor notifications" on public.notifications
  for all using (auth.jwt()->>'role' = 'advisor' and auth.uid() = user_id)
  with check (auth.jwt()->>'role' = 'advisor' and auth.uid() = user_id);
create policy "Admin manage notifications" on public.notifications
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Admin Settings
alter table public.admin_settings enable row level security;
create policy "Client read settings" on public.admin_settings
  for select using (auth.jwt()->>'role' = 'client');
create policy "Advisor read settings" on public.admin_settings
  for select using (auth.jwt()->>'role' = 'advisor');
create policy "Admin manage settings" on public.admin_settings
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- User Logs
alter table public.user_logs enable row level security;
create policy "Client read own logs" on public.user_logs
  for select using (auth.jwt()->>'role' = 'client' and auth.uid() = user_id);
create policy "Advisor read own logs" on public.user_logs
  for select using (auth.jwt()->>'role' = 'advisor' and auth.uid() = user_id);
create policy "Admin manage logs" on public.user_logs
  for all using (auth.jwt()->>'role' = 'admin')
  with check (auth.jwt()->>'role' = 'admin');

-- Seed Data
insert into public.profiles (id, email, full_name, role) values
    ('00000000-0000-0000-0000-000000000001', 'client@example.com', 'Client User', 'client'),
    ('00000000-0000-0000-0000-000000000002', 'advisor@example.com', 'Advisor User', 'advisor'),
    ('00000000-0000-0000-0000-000000000003', 'admin@example.com', 'Admin User', 'admin');

insert into public.products (id, name, description) values
    ('11111111-1111-1111-1111-111111111111', 'Product A', 'First product'),
    ('22222222-2222-2222-2222-222222222222', 'Product B', 'Second product'),
    ('33333333-3333-3333-3333-333333333333', 'Product C', 'Third product');

insert into public.product_variants (product_id, name, sku, price) values
    ('11111111-1111-1111-1111-111111111111', 'Red',  'SKU-A-RED', 10.00),
    ('11111111-1111-1111-1111-111111111111', 'Blue', 'SKU-A-BLU', 12.00),
    ('22222222-2222-2222-2222-222222222222', 'Small', 'SKU-B-S', 20.00),
    ('22222222-2222-2222-2222-222222222222', 'Large', 'SKU-B-L', 25.00),
    ('33333333-3333-3333-3333-333333333333', 'Pack', 'SKU-C-P', 30.00),
    ('33333333-3333-3333-3333-333333333333', 'Box',  'SKU-C-B', 35.00);

