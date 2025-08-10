const assert = require('assert');

function applyPromotions(items, promotions) {
  const result = items.map((i) => ({ ...i, discount_tnd: 0 }));

  for (const p of promotions.filter((p) => p.type === 'pack')) {
    const ids = p.condition.product_variant_ids || [];
    const price = p.condition.price;
    const matches = ids.map((id) => result.find((r) => r.product_variant_id === id));
    if (matches.some((m) => !m)) continue;
    const packCount = Math.min(...matches.map((m) => m.qty));
    if (packCount <= 0) continue;
    const sumPrice = matches.reduce((s, m) => s + m.unit_price_tnd, 0);
    const discountPerPack = sumPrice - price;
    const discountPerItem = discountPerPack / ids.length;
    matches.forEach((m) => {
      m.discount_tnd += (discountPerItem * packCount) / m.qty;
    });
  }

  for (const p of promotions.filter((p) => p.type === 'two_plus_one')) {
    const c = p.condition;
    if (c.product_variant_id) {
      const item = result.find((r) => r.product_variant_id === c.product_variant_id);
      if (!item) continue;
      const freeCount = Math.floor(item.qty / 3);
      if (freeCount <= 0) continue;
      const totalDiscount = freeCount * item.unit_price_tnd;
      item.discount_tnd += totalDiscount / item.qty;
    } else {
      const ids = c.product_variant_ids || [];
      const maxDiff = c.price_diff_tnd ?? 0;
      const units = [];
      for (const item of result.filter((r) => ids.includes(r.product_variant_id))) {
        for (let i = 0; i < item.qty; i++) units.push(item);
      }
      units.sort((a, b) => b.unit_price_tnd - a.unit_price_tnd);
      while (units.length >= 3) {
        const group = units.slice(0, 3);
        const diff = group[0].unit_price_tnd - group[2].unit_price_tnd;
        if (diff <= maxDiff) {
          const cheapest = group[2];
          cheapest.discount_tnd += cheapest.unit_price_tnd / cheapest.qty;
          units.splice(0, 3);
        } else {
          units.shift();
        }
      }
    }
  }

  for (const p of promotions.filter((p) => p.type === 'discount')) {
    const id = p.condition.product_variant_id;
    const percent = p.condition.percent;
    const item = result.find((r) => r.product_variant_id === id);
    if (!item) continue;
    item.discount_tnd += item.unit_price_tnd * (percent / 100);
  }

  return result;
}

// Overlapping promotions: discount + two_plus_one
(() => {
  const items = [{ product_variant_id: 1, qty: 3, unit_price_tnd: 10 }];
  const promotions = [
    { type: 'discount', condition: { product_variant_id: 1, percent: 10 } },
    { type: 'two_plus_one', condition: { product_variant_id: 1 } },
  ];
  const res = applyPromotions(items, promotions);
  const totalDiscount = res[0].discount_tnd * res[0].qty;
  assert(Math.abs(totalDiscount - 13) < 1e-6);
})();

// Two_plus_one across equal prices
(() => {
  const items = [
    { product_variant_id: 1, qty: 1, unit_price_tnd: 10 },
    { product_variant_id: 2, qty: 2, unit_price_tnd: 10 },
  ];
  const promotions = [
    { type: 'two_plus_one', condition: { product_variant_ids: [1, 2] } },
  ];
  const res = applyPromotions(items, promotions);
  const totalDiscount = res.reduce((s, i) => s + i.discount_tnd * i.qty, 0);
  assert.strictEqual(totalDiscount, 10);
})();

// Two_plus_one with price difference allowance
(() => {
  const items = [
    { product_variant_id: 1, qty: 1, unit_price_tnd: 10 },
    { product_variant_id: 2, qty: 1, unit_price_tnd: 9 },
    { product_variant_id: 3, qty: 1, unit_price_tnd: 10 },
  ];
  const promotions = [
    {
      type: 'two_plus_one',
      condition: { product_variant_ids: [1, 2, 3], price_diff_tnd: 1 },
    },
  ];
  const res = applyPromotions(items, promotions);
  const item2 = res.find((i) => i.product_variant_id === 2);
  assert.strictEqual(item2.discount_tnd, 9);
})();

console.log('apply_promotions tests passed');
