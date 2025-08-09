-- RPC for searching products with combined fields and pagination
create or replace function public.search_products(
  query text default '',
  page int default 1,
  per_page int default 20
)
returns setof public.products
language sql
stable
as $$
  select *
  from public.products
  where (
      query = '' or
      to_tsvector('simple',
        coalesce(inspired_name,'') || ' ' ||
        coalesce(inspired_brand,'') || ' ' ||
        coalesce(array_to_string(top_notes,' '), '') || ' ' ||
        coalesce(array_to_string(heart_notes,' '), '') || ' ' ||
        coalesce(array_to_string(base_notes,' '), '')
      ) @@ plainto_tsquery('simple', query)
    )
    and active
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
    coalesce(array_to_string(base_notes,' '), '')
  )
);
