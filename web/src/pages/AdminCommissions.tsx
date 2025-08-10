import { useCommissions, payCommission, Commission } from '../services/commissions';
import CommissionFilters, { CommissionFilterValues } from '../components/CommissionFilters';
import { useMemo, useState } from 'react';

export default function AdminCommissions() {
  const [filters, setFilters] = useState<CommissionFilterValues>({});
  const { data: commissions, refetch } = useCommissions({
    from: filters.from,
    to: filters.to,
    referrer_id: filters.referrerId,
  });

  const aggregates = useMemo(() => {
    if (!commissions) return [] as { referrer_id: string; total: number }[];
    const map = new Map<string, number>();
    for (const c of commissions) {
      if (!c.referrer_id) continue;
      map.set(c.referrer_id, (map.get(c.referrer_id) || 0) + c.amount_tnd);
    }
    return Array.from(map.entries()).map(([referrer_id, total]) => ({ referrer_id, total }));
  }, [commissions]);

  const payments = useMemo(() => {
    if (!commissions) return [] as Commission[];
    return commissions.filter(c => c.commission_payment_items && c.commission_payment_items.length > 0);
  }, [commissions]);

  async function handlePay(c: Commission) {
    await payCommission(c);
    refetch();
  }

  function exportXlsx() {
    const header = 'referrer_id,total_tnd\n';
    const rows = aggregates.map(a => `${a.referrer_id},${a.total}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'commissions.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Commissions</h1>
      <CommissionFilters value={filters} onChange={setFilters} />

      <h2 className="mt-4 font-serif text-xl">Soldes agrégés</h2>
      <table className="mt-2 w-full text-left">
        <thead>
          <tr>
            <th>Conseiller</th>
            <th>Total TND</th>
          </tr>
        </thead>
        <tbody>
          {aggregates.map(a => (
            <tr key={a.referrer_id}>
              <td>{a.referrer_id}</td>
              <td>{a.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={exportXlsx} className="mt-2 text-sm text-blue-600">
        Export .xlsx
      </button>

      <h2 className="mt-8 font-serif text-xl">Historique des paiements</h2>
      <ul className="mt-2 flex flex-col gap-2">
        {payments.map(c => (
          <li key={c.id} className="flex justify-between">
            <span>
              Commission {c.id} – {c.amount_tnd} TND
            </span>
            <span className="text-sm text-gray-500">Paiement {c.commission_payment_items![0].payment_id}</span>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-serif text-xl">Détails</h2>
      <ul className="mt-4 flex flex-col gap-2">
        {commissions?.map(c => (
          <li key={c.id} className="flex justify-between">
            <span>
              Niveau {c.level} – {c.amount_tnd} TND
            </span>
            {c.commission_payment_items && c.commission_payment_items.length > 0 ? (
              <span className="text-sm text-gray-500">Payée</span>
            ) : (
              <button onClick={() => handlePay(c)} className="text-sm text-green-600">
                Payer
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

