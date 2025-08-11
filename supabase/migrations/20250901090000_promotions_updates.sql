-- Add promotion metadata and promotion_items table

-- Add columns to promotions table
alter table public.promotions
  add column if not exists name text not null default '',
  add column if not exists priority integer not null default 0,
  add column if not exists combinable boolean not null default true,
  add column if not exists scope_json jsonb not null default '{}'::jsonb;

-- Create promotion_items table
create table if not exists public.promotion_items (
  id bigserial primary key,
  promotion_id bigint references public.promotions on delete cascade,
  product_id bigint references public.products on delete cascade,
  variant_id bigint references public.product_variants on delete cascade,
  params_json jsonb not null default '{}'::jsonb
);

create index if not exists promotion_items_promotion_id_idx on public.promotion_items(promotion_id);
create index if not exists promotion_items_product_id_idx on public.promotion_items(product_id);
create index if not exists promotion_items_variant_id_idx on public.promotion_items(variant_id);
