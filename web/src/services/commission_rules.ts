import { useQuery } from '@tanstack/react-query';

export interface CommissionRule {
  id?: number;
  level: number;
  rate: number;
  referrer_id: string | null;
}

const baseUrl = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

async function fetchCommissionRules() {
  const res = await fetch(`${baseUrl}/rest/v1/commission_rules?select=*`, { headers });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as CommissionRule[];
}

export function useCommissionRules() {
  return useQuery({ queryKey: ['commission_rules'], queryFn: fetchCommissionRules });
}

export async function saveCommissionRule(rule: CommissionRule) {
  const method = rule.id ? 'PATCH' : 'POST';
  const url = `${baseUrl}/rest/v1/commission_rules${rule.id ? `?id=eq.${rule.id}` : ''}`;
  const res = await fetch(url, { method, headers, body: JSON.stringify(rule) });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

