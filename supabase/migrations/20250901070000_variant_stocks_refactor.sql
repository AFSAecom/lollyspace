-- Move stock quantities to dedicated table

-- Rename columns in variant_stocks table
alter table public.variant_stocks
  rename column product_variant_id to variant_id;

alter table public.variant_stocks
  rename column qty to stock_current;

alter table public.variant_stocks
  add column stock_min integer not null default 0;

alter table public.variant_stocks
  add column created_at timestamptz not null default now();

alter table public.variant_stocks
  alter column updated_at set default now();

-- Migrate existing stock data from product_variants
insert into public.variant_stocks (variant_id, stock_current, stock_min)
select id, stock_qty, stock_min from public.product_variants
on conflict (variant_id) do update
  set stock_current = excluded.stock_current,
      stock_min = excluded.stock_min,
      updated_at = now();

-- Remove stock columns from product_variants
alter table public.product_variants drop column stock_qty;
alter table public.product_variants drop column stock_min;

-- Rename foreign key columns for consistency
alter table public.stock_adjustments
  rename column product_variant_id to variant_id;
