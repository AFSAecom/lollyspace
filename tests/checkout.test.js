const assert = require('assert');

const calls = [];

global.fetch = async (url, options) => {
  calls.push({ url, options });
  if (url.toString().includes('apply_promotions')) {
    const body = JSON.parse(options.body);
    return { ok: true, json: async () => ({ items: body.items }) };
  }
  if (url.toString().includes('checkout_advisor')) {
    return { ok: true, json: async () => ({ id: 99 }) };
  }
  throw new Error('unexpected url');
};

async function checkoutAdvisor(payload) {
  const promo = await global.fetch('apply_promotions', {
    method: 'POST',
    body: JSON.stringify({ items: payload.items }),
  }).then((r) => r.json());
  const res = await global.fetch('checkout_advisor', {
    method: 'POST',
    body: JSON.stringify({ ...payload, items: promo.items }),
  });
  if (!res.ok) throw new Error('network');
  return res.json();
}

(async () => {
  const payload = {
    advisor_id: 'A1',
    client: { id: 'C1' },
    items: [
      {
        product_variant_id: 1,
        quantity: 2,
        unit_price_tnd: 10,
        discount_tnd: 0,
      },
    ],
  };
  const res = await checkoutAdvisor(payload);
  assert.strictEqual(res.id, 99);
  const checkoutCall = calls.find((c) =>
    c.url.toString().includes('checkout_advisor'),
  );
  const sent = JSON.parse(checkoutCall.options.body);
  assert.strictEqual(sent.items[0].product_variant_id, 1);
  assert.strictEqual(sent.items[0].unit_price_tnd, 10);
  assert.strictEqual(sent.items[0].discount_tnd, 0);
  console.log('All tests passed');
})();

