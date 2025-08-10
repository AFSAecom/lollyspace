-- Add referral columns to profiles and activate_seed function
alter table public.profiles
  add column referrer_id uuid references public.profiles(id),
  add column seed_code text unique;

create or replace function public.activate_seed(seed_code text, client_id uuid)
returns uuid as $$
DECLARE
  ref_id uuid;
BEGIN
  select id into ref_id from public.profiles where seed_code = activate_seed.seed_code;
  if ref_id is null then
    raise exception 'Invalid seed code';
  end if;
  update public.profiles set referrer_id = ref_id where id = client_id;
  return ref_id;
END;
$$ language plpgsql security definer;

grant execute on function public.activate_seed(text, uuid) to anon, authenticated, service_role;
