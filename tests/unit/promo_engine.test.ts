const test = require('node:test');
const assert = require('assert');
const { promoEngine } = require('../../src/lib/promo/engine.ts');

const now = new Date('2024-01-01');

const cases = [
  {
    name: 'overlapping promotions choose largest discount',
    cart: [{ id: 'A', qty: 3, price: 100 }],
    promos: [
      { id: 'P1', type: 'PERCENT', productId: 'A', percent: 10 },
      { id: 'P2', type: 'FIXED', productId: 'A', amount: 200 },
      { id: 'P3', type: 'BxGy', productId: 'A', buy_qty: 2, get_qty: 1, combinable: false },
    ],
    expected: { totalDiscount: 300, applied: ['P2'] },
  },
  {
    name: 'expired promotion ignored by date limits',
    cart: [{ id: 'A', qty: 1, price: 100 }],
    promos: [
      { id: 'P1', type: 'PERCENT', productId: 'A', percent: 50, start: '2030-01-01', end: '2030-12-31' },
    ],
    now: new Date('2029-12-31'),
    expected: { totalDiscount: 0, applied: [] },
  },
  {
    name: 'quantity bounds prevent promotion',
    cart: [
      { id: 'A', qty: 1, price: 100 },
      { id: 'B', qty: 5, price: 10 },
    ],
    promos: [
      { id: 'P1', type: 'PERCENT', productId: 'A', percent: 50, minQty: 2 },
      { id: 'P2', type: 'FIXED', productId: 'B', amount: 5, maxQty: 3 },
    ],
    expected: { totalDiscount: 0, applied: [] },
  },
  {
    name: 'BxGy applies correct free units',
    cart: [{ id: 'A', qty: 5, price: 10 }],
    promos: [
      { id: 'P1', type: 'BxGy', productId: 'A', buy_qty: 2, get_qty: 1 },
    ],
    expected: { totalDiscount: 10, applied: ['P1'] },
  },
  {
    name: 'BxGy not applied when quantity insufficient',
    cart: [{ id: 'A', qty: 2, price: 10 }],
    promos: [
      { id: 'P1', type: 'BxGy', productId: 'A', buy_qty: 2, get_qty: 1 },
    ],
    expected: { totalDiscount: 0, applied: [] },
  },
  {
    name: 'PACK3 handles mixed prices',
    cart: [
      { id: 'A', qty: 1, price: 10 },
      { id: 'B', qty: 1, price: 20 },
      { id: 'C', qty: 1, price: 30 },
    ],
    promos: [
      { id: 'P1', type: 'PACK3', productIds: ['A', 'B', 'C'], pack_price: 50 },
    ],
    expected: { totalDiscount: 10, applied: ['P1'] },
  },
  {
    name: 'PACK3 ignored when a product missing',
    cart: [
      { id: 'A', qty: 1, price: 10 },
      { id: 'B', qty: 1, price: 20 },
    ],
    promos: [
      { id: 'P1', type: 'PACK3', productIds: ['A', 'B', 'C'], pack_price: 50 },
    ],
    expected: { totalDiscount: 0, applied: [] },
  },
];

for (const c of cases) {
  test(c.name, () => {
    const res = promoEngine(c.cart, c.promos, c.now || now);
    assert.strictEqual(res.totalDiscount, c.expected.totalDiscount);
    assert.deepStrictEqual(res.applied.map((a) => a.id).sort(), c.expected.applied.sort());
    // Ensure cartAfter discounts sum matches total
    const sum = res.cartAfter.reduce((s, i) => s + i.discount, 0);
    assert.strictEqual(sum, c.expected.totalDiscount);
  });
}
