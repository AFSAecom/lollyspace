import { useState } from 'react';
import { useCartStore } from '@/stores/cart';
import { checkoutAdvisorWithOffline } from '@/services/checkout';

export default function AdvisorCheckout() {
  const items = useCartStore((s) => s.items);
  const reset = useCartStore((s) => s.reset);
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const total = items.reduce(
    (sum, i) => sum + (i.unit_price_tnd - (i.discount_tnd ?? 0)) * i.qty,
    0,
  );

  const finalize = async () => {
    try {
      await checkoutAdvisorWithOffline({
        advisor_id: 'advisor',
        client: { first_name: contact, last_name: '', phone: contact },
        items: items.map((i) => ({
          product_variant_id: i.product_variant_id,
          qty: i.qty,
          unit_price_tnd: i.unit_price_tnd,
          discount_tnd: i.discount_tnd,
        })),
      });
      reset();
    } catch {
      /* handle error */
    }
  };

  return (
    <div>
      <h1 className="font-serif text-2xl mb-4">Checkout</h1>
      <div className="mb-4">
        {items.map((i) => (
          <div key={i.product_variant_id}>
            {i.name} x{i.qty} -
            {(i.unit_price_tnd - (i.discount_tnd ?? 0)) * i.qty} TND
          </div>
        ))}
        <div className="font-bold">Total: {total} TND</div>
      </div>
      <div className="mb-2">
        <input
          className="border p-2 w-full mb-2"
          placeholder="Téléphone ou Email"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-4"
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={finalize}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Finaliser
        </button>
      </div>
    </div>
  );
}
