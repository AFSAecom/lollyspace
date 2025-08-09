create or replace function search_products(
  q text,
  notes text[],
  gender text,
  season text,
  family text,
  page int default 1,
  limit int default 20
) returns table (items jsonb, total bigint)
language sql
as $$
  with filtered as (
    select * from products p
    where (
      q is null or
      to_tsvector('simple', p.name || ' ' || coalesce(p.description,'') || ' ' || array_to_string(p.notes,' ')) @@ plainto_tsquery('simple', q)
    )
    and (notes is null or p.notes && notes)
    and (gender is null or p.gender = gender)
    and (season is null or p.season = season)
    and (family is null or p.family = family)
  ), counted as (
    select count(*) as total from filtered
  ), paged as (
    select * from filtered
    offset ((page - 1) * limit)
    limit limit
  )
  select coalesce(jsonb_agg(paged), '[]'::jsonb) as items, counted.total
  from paged, counted;
$$;

create index if not exists products_notes_gin on products using gin(notes);
create index if not exists products_search_idx on products using gin(to_tsvector('simple', name || ' ' || coalesce(description,'') || ' ' || array_to_string(notes,' ')));
