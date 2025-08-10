create or replace function public.rpc_get_stock_state(
  page int,
  size int,
  filters jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
stable
as $$
declare
  result jsonb;
begin
  result := jsonb_build_object(
    'rows', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb) from (
        select
          pv.id,
          pv.product_id,
          pv.volume_ml,
          pv.price_tnd,
          pv.discount_tnd,
          pv.name,
          pv.variant_code,
          jsonb_build_object(
            'stock_current', coalesce(vs.stock_current, 0),
            'stock_min', coalesce(vs.stock_min, 0)
          ) as variant_stocks,
          jsonb_build_object(
            'inspired_name', p.inspired_name
          ) as products
        from public.product_variants pv
        join public.products p on p.id = pv.product_id
        left join public.variant_stocks vs on vs.variant_id = pv.id
        order by pv.id
        limit size offset greatest(page - 1, 0) * size
      ) t
    ),
    'counts', jsonb_build_object(
      'ruptures', (
        select count(*)
        from public.product_variants pv
        left join public.variant_stocks vs on vs.variant_id = pv.id
        where coalesce(vs.stock_current, 0) = 0
      ),
      'low', (
        select count(*)
        from public.product_variants pv
        left join public.variant_stocks vs on vs.variant_id = pv.id
        where coalesce(vs.stock_current, 0) > 0
          and coalesce(vs.stock_current, 0) < coalesce(vs.stock_min, 0)
      ),
      'ok', (
        select count(*)
        from public.product_variants pv
        left join public.variant_stocks vs on vs.variant_id = pv.id
        where coalesce(vs.stock_current, 0) >= coalesce(vs.stock_min, 0)
      )
    )
  );
  return result;
end;
$$;
