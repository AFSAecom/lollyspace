create or replace function public.rpc_search_products(
  q_brand_name text,
  q_ingredients text,
  gender text,
  season text,
  family text,
  page int,
  page_size int
)
returns setof public.products
language sql
stable
as $$
  select *
  from public.products
  where active
    and (
      q_brand_name is null or q_brand_name = '' or
      to_tsvector('simple', coalesce(inspired_name,'') || ' ' || coalesce(inspired_brand,''))
        @@ plainto_tsquery('simple', q_brand_name)
    )
    and (
      q_ingredients is null or q_ingredients = '' or
      to_tsvector('simple',
        coalesce(array_to_string(top_notes,' '), '') || ' ' ||
        coalesce(array_to_string(heart_notes,' '), '') || ' ' ||
        coalesce(array_to_string(base_notes,' '), '') || ' ' ||
        coalesce(olfactory_family,'')
      ) @@ plainto_tsquery('simple', q_ingredients)
    )
    and (gender is null or gender = '' or public.products.gender = gender)
    and (season is null or season = '' or public.products.season = season)
    and (family is null or family = '' or public.products.olfactory_family = family)
  order by id
  limit page_size offset (page - 1) * page_size;
$$;

-- Separate GIN indexes for brand/name and ingredients
create index if not exists products_brand_name_idx on public.products using gin (
  to_tsvector('simple', coalesce(inspired_name,'') || ' ' || coalesce(inspired_brand,''))
);

create index if not exists products_ingredients_idx on public.products using gin (
  to_tsvector('simple',
    coalesce(array_to_string(top_notes,' '), '') || ' ' ||
    coalesce(array_to_string(heart_notes,' '), '') || ' ' ||
    coalesce(array_to_string(base_notes,' '), '') || ' ' ||
    coalesce(olfactory_family,'')
  )
);
