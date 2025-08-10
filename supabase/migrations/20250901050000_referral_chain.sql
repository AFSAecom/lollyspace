-- Add referral chain support

-- Ensure required extension for HTTP requests
create extension if not exists "pg_net";

-- Update profiles table for referral chain
alter table public.profiles
  add column if not exists referrer_id uuid,
  add column if not exists seed_code text,
  add column if not exists seed_activated_at timestamptz;

-- Configure foreign key and uniqueness
alter table public.profiles
  drop constraint if exists profiles_referrer_id_fkey;
alter table public.profiles
  add constraint profiles_referrer_id_fkey foreign key (referrer_id)
    references public.profiles(id) on delete set null;

create unique index if not exists profiles_seed_code_idx on public.profiles (seed_code);
create index if not exists profiles_referrer_id_idx on public.profiles (referrer_id);

alter table public.profiles
  add constraint if not exists profiles_referrer_self_chk
    check (referrer_id is null or referrer_id <> id);

-- Row level security: allow users to update their row but not referrer_id
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
  for update
  using (
    auth.uid() = id or current_setting('request.jwt.claim.role', true) = 'admin'
  )
  with check (
    (auth.uid() = id and referrer_id is not distinct from (select referrer_id from public.profiles where id = auth.uid()))
    or current_setting('request.jwt.claim.role', true) = 'admin'
  );

-- RPC to activate seed
create or replace function public.rpc_activate_seed()
returns text as $$
declare
  code text;
begin
  code := encode(gen_random_bytes(6), 'hex');
  update public.profiles
    set seed_code = code,
        seed_activated_at = now()
    where id = auth.uid()
    returning seed_code into code;
  return code;
end;
$$ language plpgsql security definer;

grant execute on function public.rpc_activate_seed() to authenticated;

-- RPC to set referrer by seed code with cycle check up to 3 levels
create or replace function public.rpc_set_referrer(seed_code text)
returns uuid as $$
declare
  ref_id uuid;
  cur uuid;
  i int;
begin
  select id into ref_id from public.profiles where seed_code = rpc_set_referrer.seed_code;
  if ref_id is null then
    raise exception 'Invalid seed code';
  end if;

  cur := ref_id;
  for i in 1..3 loop
    exit when cur is null;
    if cur = auth.uid() then
      raise exception 'Referral cycle detected';
    end if;
    select referrer_id into cur from public.profiles where id = cur;
  end loop;

  update public.profiles set referrer_id = ref_id where id = auth.uid();
  return ref_id;
end;
$$ language plpgsql security definer;

grant execute on function public.rpc_set_referrer(text) to authenticated;

drop function if exists public.activate_seed(text, uuid);

-- Trigger to invoke compute_commissions edge function after order insert
create or replace function public.trigger_compute_commissions()
returns trigger as $$
begin
  perform net.http_post(
    'http://localhost:54321/functions/v1/compute_commissions',
    '{}'::jsonb,
    jsonb_build_object('order_id', new.id)::text
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger orders_compute_commissions
  after insert on public.orders
  for each row
  execute function public.trigger_compute_commissions();
