const assert = require('assert');

const orders = [];
const orderItems = [];
const commissions = [];

const profiles = [
  { id: 'A', referrer_id: null },
  { id: 'B', referrer_id: 'A' },
  { id: 'C', referrer_id: 'B' },
  { id: 'D', referrer_id: 'C' },
];

const rules = [
  { level: 1, rate: 0.1 },
  { level: 2, rate: 0.05 },
  { level: 3, rate: 0.02 },
];

function computeCommissions(order) {
  const getProfile = (id) => profiles.find((p) => p.id === id);
  const refs = [];
  let cur = getProfile(order.user_id);
  for (let i = 0; i < 3; i++) {
    const ref = cur && cur.referrer_id;
    refs.push(ref);
    cur = ref ? getProfile(ref) : undefined;
  }
  refs.forEach((r, idx) => {
    if (!r) return;
    const rate = rules.find((rr) => rr.level === idx + 1)?.rate || 0;
    commissions.push({ referrer_id: r, amount: order.total_tnd * rate });
  });
}

function checkoutAdvisor(payload) {
  const promoItems = payload.items; // promotions already applied
  const total = promoItems.reduce(
    (sum, i) => sum + (i.unit_price_tnd - (i.discount_tnd || 0)) * i.qty,
    0,
  );
  const order = {
    id: orders.length + 1,
    user_id: payload.client.id,
    advisor_id: payload.advisor_id,
    total_tnd: total,
  };
  orders.push(order);
  for (const item of promoItems) {
    const lineTotal =
      (item.unit_price_tnd - (item.discount_tnd || 0)) * item.qty;
    orderItems.push({
      order_id: order.id,
      product_variant_id: item.product_variant_id,
      qty: item.qty,
      unit_price_tnd: item.unit_price_tnd,
      discount_tnd: item.discount_tnd || 0,
      total_line_tnd: lineTotal,
    });
  }
  computeCommissions(order);
  return { id: order.id };
}

(async () => {
  const res = checkoutAdvisor({
    advisor_id: 'ADV',
    client: { id: 'D' },
    items: [
      { product_variant_id: 1, qty: 2, unit_price_tnd: 10, discount_tnd: 1 },
    ],
  });
  assert.strictEqual(res.id, 1);
  assert.strictEqual(orders.length, 1);
  assert.strictEqual(orderItems.length, 1);
  assert.strictEqual(orderItems[0].total_line_tnd, 18);
  assert.strictEqual(commissions.length, 3);
  assert.deepStrictEqual(
    commissions.map((c) => c.referrer_id),
    ['C', 'B', 'A'],
  );
  assert.deepStrictEqual(
    commissions.map((c) => c.amount),
    [1.8, 0.9, 0.36],
  );
  console.log('All tests passed');
})();

