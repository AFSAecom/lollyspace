import { useCommissions, payCommission, Commission } from '../services/commissions';

export default function AdminCommissions() {
  const { data: commissions, refetch } = useCommissions();

  async function handlePay(c: Commission) {
    await payCommission(c);
    refetch();
  }

  return (
    <div>
      <h1 className="font-serif text-2xl">Commissions</h1>
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

