import { useState } from 'react';
import { useCartStore } from '@/stores/cart';
import { checkoutAdvisorWithOffline } from '@/services/checkout';
import type { PromotionItem } from '@/services/promotions';

export default function AdvisorCart() {
  const { items, update, remove, reset } = useCartStore();
  const [loading, setLoading] = useState(false);
  const handleCheckout = async () => {
    setLoading(true);
    try {
      await checkoutAdvisorWithOffline({
        advisor_id: 'A1',
        client: { id: 'C1' },
        items: items.map<PromotionItem>((i) => ({
          product_variant_id: i.product_variant_id,
          qty: i.qty,
          unit_price_tnd: i.unit_price_tnd,
          discount_tnd: i.discount_tnd,
        })),
      });
      reset();
    } catch (e) {
      // in offline mode, checkoutAdvisorWithOffline will queue the sale
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-serif text-xl mb-4">Panier</h2>
      <div className="flex flex-col gap-2">
        {items.map((i) => (
          <div
            key={i.product_variant_id}
            className="flex items-center justify-between border p-2 rounded"
          >
            <div>
              <p>{i.name}</p>
              <p className="text-sm text-muted">
                {i.qty} × {i.unit_price_tnd} TND
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => update(i.product_variant_id, i.qty - 1)}
                className="px-2 py-1 border rounded"
              >
                -
              </button>
              <span>{i.qty}</span>
              <button
                onClick={() => update(i.product_variant_id, i.qty + 1)}
                className="px-2 py-1 border rounded"
              >
                +
              </button>
              <button
                onClick={() => remove(i.product_variant_id)}
                className="px-2 py-1 border rounded text-red-500"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        disabled={items.length === 0 || loading}
        onClick={handleCheckout}
        className="mt-4 px-4 py-2 bg-primary text-background rounded"
      >
        Finaliser
      </button>
    </div>
  );
}

