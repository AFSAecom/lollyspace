create or replace function public.search_products(
  query_name_brand text default '',
  query_notes text default '',
  gender text default null,
  season text default null,
  family text default null,
  page int default 1,
  per_page int default 20
)
returns setof public.products
language sql
stable
as $$
  select *
  from public.products
  where active
    and (
      query_name_brand = '' or
      to_tsvector('simple', coalesce(inspired_name,'') || ' ' || coalesce(inspired_brand,''))
        @@ plainto_tsquery('simple', query_name_brand)
    )
    and (
      query_notes = '' or
      to_tsvector('simple',
        coalesce(array_to_string(top_notes,' '), '') || ' ' ||
        coalesce(array_to_string(heart_notes,' '), '') || ' ' ||
        coalesce(array_to_string(base_notes,' '), '') || ' ' ||
        coalesce(olfactory_family,'')
      ) @@ plainto_tsquery('simple', query_notes)
    )
    and (gender is null or gender = '' or public.products.gender = gender)
    and (season is null or season = '' or public.products.season = season)
    and (family is null or family = '' or public.products.olfactory_family = family)
  order by id
  limit per_page offset (page - 1) * per_page;
$$;

-- Combined GIN index for search
create index if not exists products_search_idx on public.products using gin (
  to_tsvector('simple',
    coalesce(inspired_name,'') || ' ' ||
    coalesce(inspired_brand,'') || ' ' ||
    coalesce(array_to_string(top_notes,' '), '') || ' ' ||
    coalesce(array_to_string(heart_notes,' '), '') || ' ' ||
    coalesce(array_to_string(base_notes,' '), '') || ' ' ||
    coalesce(olfactory_family,'')
  )
);
