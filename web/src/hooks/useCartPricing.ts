import { useEffect } from 'react';
import { useCartStore } from '@/stores/cart';
import { applyPromotions } from '@/services/promotions';

const promoEnabled = import.meta.env.VITE_PROMO_V2_ENABLED === 'true';

export function useCartPricing() {
  const items = useCartStore((s) => s.items);
  const setPricing = useCartStore((s) => s.setPricing);

  useEffect(() => {
    async function price() {
      if (!promoEnabled) {
        setPricing(items.map((i) => ({ product_variant_id: i.product_variant_id, discount_tnd: 0 })));
        return;
      }
      if (items.length === 0) {
        setPricing([]);
        return;
      }
      try {
        const res = await applyPromotions(
          items.map((i) => ({
            product_variant_id: i.product_variant_id,
            qty: i.qty,
            unit_price_tnd: i.unit_price_tnd,
          })),
        );
        setPricing(
          res.items.map((i) => ({
            product_variant_id: i.product_variant_id,
            discount_tnd: i.discount_tnd ?? 0,
          })),
        );
      } catch (e) {
        console.error(e);
      }
    }
    void price();
  }, [items, setPricing]);

  const total = items.reduce(
    (sum, i) => sum + (i.unit_price_tnd - (i.discount_tnd ?? 0)) * i.qty,
    0,
  );

  return { items, total };
}

export default useCartPricing;
