-- Sample profiles
insert into profiles (id, role, first_name, last_name, phone)
values
  ('00000000-0000-0000-0000-000000000001', 'client', 'Alice', 'Client', '10000001'),
  ('00000000-0000-0000-0000-000000000002', 'client', 'Bob', 'Client', '10000002'),
  ('00000000-0000-0000-0000-000000000003', 'advisor', 'Cathy', 'Advisor', '10000003'),
  ('00000000-0000-0000-0000-000000000004', 'admin', 'Adam', 'Admin', '10000004');

-- Sample products
insert into products (product_code, inspired_name, inspired_brand, gender, season, olfactory_family, top_notes, heart_notes, base_notes, description, image_url, active)
values
  ('P001', 'Floral Breeze', 'BrandA', 'female', 'spring', 'floral', '{rose}', '{jasmine}', '{musk}', 'Fresh floral scent', '', true),
  ('P002', 'Citrus Splash', 'BrandB', 'unisex', 'summer', 'citrus', '{orange}', '{lemon}', '{amber}', 'Citrus burst', '', true),
  ('P003', 'Woody Night', 'BrandC', 'male', 'winter', 'woody', '{cedar}', '{patchouli}', '{vanilla}', 'Warm woody aroma', '', true);

-- Variants
insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P001-15', id, 15, 20, 10 from products where product_code = 'P001';
insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P001-30', id, 30, 35, 18 from products where product_code = 'P001';
insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P001-50', id, 50, 50, 25 from products where product_code = 'P001';
insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P001-100', id, 100, 90, 45 from products where product_code = 'P001';

insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P002-15', id, 15, 18, 9 from products where product_code = 'P002';
insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P002-30', id, 30, 32, 16 from products where product_code = 'P002';
insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P002-50', id, 50, 45, 22 from products where product_code = 'P002';
insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P002-100', id, 100, 80, 40 from products where product_code = 'P002';

insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P003-15', id, 15, 22, 11 from products where product_code = 'P003';
insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P003-30', id, 30, 38, 19 from products where product_code = 'P003';
insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P003-50', id, 50, 55, 27 from products where product_code = 'P003';
insert into product_variants (variant_code, product_id, volume_ml, price_tnd, cost_tnd)
select 'P003-100', id, 100, 95, 47 from products where product_code = 'P003';

-- Variant stocks
insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 50, 5 from product_variants where variant_code = 'P001-15';
insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 40, 5 from product_variants where variant_code = 'P001-30';
insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 30, 5 from product_variants where variant_code = 'P001-50';
insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 20, 5 from product_variants where variant_code = 'P001-100';

insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 60, 5 from product_variants where variant_code = 'P002-15';
insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 50, 5 from product_variants where variant_code = 'P002-30';
insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 40, 5 from product_variants where variant_code = 'P002-50';
insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 30, 5 from product_variants where variant_code = 'P002-100';

insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 50, 5 from product_variants where variant_code = 'P003-15';
insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 40, 5 from product_variants where variant_code = 'P003-30';
insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 30, 5 from product_variants where variant_code = 'P003-50';
insert into variant_stocks (variant_id, stock_current, stock_min)
select id, 20, 5 from product_variants where variant_code = 'P003-100';
