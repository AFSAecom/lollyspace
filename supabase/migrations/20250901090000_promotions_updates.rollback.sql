-- Rollback promotion metadata and promotion_items table

-- Remove added columns
alter table public.promotions
  drop column if exists name,
  drop column if exists priority,
  drop column if exists combinable,
  drop column if exists scope_json;

-- Drop promotion_items table
DROP TABLE IF EXISTS public.promotion_items;
