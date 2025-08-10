import { useQuery } from '@tanstack/react-query';

export interface Advisor {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

const baseUrl = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function fetchAdvisors() {
  const url = `${baseUrl}/rest/v1/profiles?role=eq.advisor&select=id,first_name,last_name`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as Advisor[];
}

export function useAdvisors() {
  return useQuery({ queryKey: ['advisors'], queryFn: fetchAdvisors });
}
