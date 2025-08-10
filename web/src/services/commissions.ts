import { useQuery } from '@tanstack/react-query';

export interface Commission {
  id: number;
  referrer_id: string | null;
  referee_id: string | null;
  order_id: number | null;
  level: number;
  amount_tnd: number;
  created_at: string;
  paid_at?: string | null;
  commission_payment_items?: { payment_id: number }[];
}

const baseUrl = import.meta.env.VITE_SUPABASE_URL;
const headers = {
  apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

interface FetchParams {
  from?: string;
  to?: string;
  referrer_id?: string;
  status?: 'paid' | 'unpaid';
  seed?: string;
}

function buildQuery(params: FetchParams) {
  const search = new URLSearchParams();
  search.append('select', '*,commission_payment_items(payment_id)');
  if (params.from) {
    search.append('created_at', `gte.${params.from}`);
  }
  if (params.to) {
    search.append('created_at', `lte.${params.to}`);
  }
  if (params.referrer_id) {
    search.append('referrer_id', `eq.${params.referrer_id}`);
  }
  if (params.status === 'paid') {
    search.append('paid_at', 'not.is.null');
  } else if (params.status === 'unpaid') {
    search.append('paid_at', 'is.null');
  }
  if (params.seed) {
    search.append('seed', params.seed);
  }
  return search.toString();
}

async function fetchCommissions(params: FetchParams = {}) {
  const url = `${baseUrl}/rest/v1/commissions?${buildQuery(params)}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return (await res.json()) as Commission[];
}

export function useCommissions(params: FetchParams = {}) {
  return useQuery({ queryKey: ['commissions', params], queryFn: () => fetchCommissions(params) });
}

export async function payCommission(c: Commission) {
  const paymentRes = await fetch(`${baseUrl}/rest/v1/commission_payments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ payee_id: c.referrer_id, amount_tnd: c.amount_tnd }),
  });
  if (!paymentRes.ok) {
    throw new Error(await paymentRes.text());
  }
  const [payment] = (await paymentRes.json()) as { id: number }[];
  await fetch(`${baseUrl}/rest/v1/commission_payment_items`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      commission_id: c.id,
      payment_id: payment.id,
      amount_tnd: c.amount_tnd,
    }),
  });
  await fetch(`${baseUrl}/rest/v1/commissions?id=eq.${c.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ paid_at: new Date().toISOString() }),
  });
}

export async function payCommissions(cs: Commission[]) {
  if (!cs.length) return;
  const total = cs.reduce((sum, c) => sum + c.amount_tnd, 0);
  const payee_id = cs[0].referrer_id;
  const paymentRes = await fetch(`${baseUrl}/rest/v1/commission_payments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ payee_id, amount_tnd: total }),
  });
  if (!paymentRes.ok) {
    throw new Error(await paymentRes.text());
  }
  const [payment] = (await paymentRes.json()) as { id: number }[];
  const items = cs.map(c => ({ commission_id: c.id, payment_id: payment.id, amount_tnd: c.amount_tnd }));
  await fetch(`${baseUrl}/rest/v1/commission_payment_items`, {
    method: 'POST',
    headers,
    body: JSON.stringify(items),
  });
  const now = new Date().toISOString();
  for (const c of cs) {
    await fetch(`${baseUrl}/rest/v1/commissions?id=eq.${c.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ paid_at: now }),
    });
  }
}

