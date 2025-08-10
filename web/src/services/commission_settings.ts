import { useQuery } from '@tanstack/react-query';

export interface CommissionSetting {
  level: number;
  rate: number;
  active: boolean;
}

const baseUrl = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function fetchCommissionSettings() {
  const res = await fetch(`${baseUrl}/rest/v1/commission_settings?select=*`, { headers });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as CommissionSetting[];
}

export function useCommissionSettings() {
  return useQuery({ queryKey: ['commission_settings'], queryFn: fetchCommissionSettings });
}

export async function saveCommissionSetting(setting: CommissionSetting) {
  const method = 'PATCH';
  const url = `${baseUrl}/rest/v1/commission_settings?level=eq.${setting.level}`;
  const res = await fetch(url, { method, headers, body: JSON.stringify(setting) });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}
