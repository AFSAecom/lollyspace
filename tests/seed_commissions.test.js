const assert = require('assert');

function activate_seed(seed_code, client, profiles) {
  const ref = profiles.find((p) => p.seed_code === seed_code);
  if (!ref) throw new Error('Invalid seed code');
  client.referrer_id = ref.id;
  return ref.id;
}

function compute_commissions(order, profiles) {
  const getProfile = (id) => profiles.find((p) => p.id === id);
  const l1 = order.advisor_id;
  const l2 = getProfile(l1)?.referrer_id;
  const l3 = getProfile(l2)?.referrer_id;
  const refs = [l1, l2, l3];
  const rates = [0.1, 0.05, 0.02];
  const commissions = [];
  refs.forEach((r, idx) => {
    if (r) {
      commissions.push({
        referrer_id: r,
        level: idx + 1,
        amount: order.total_tnd * rates[idx],
      });
    }
  });
  return commissions;
}

const profiles = [
  { id: 'A', seed_code: 'A', referrer_id: null },
  { id: 'B', seed_code: 'B', referrer_id: 'A' },
  { id: 'C', seed_code: 'C', referrer_id: 'B' },
];

const client = { id: 'D', referrer_id: null };
activate_seed('C', client, profiles);

const order = { id: 1, user_id: client.id, advisor_id: 'C', total_tnd: 100 };
const commissions = compute_commissions(order, profiles.concat(client));

assert.strictEqual(client.referrer_id, 'C');
assert.strictEqual(commissions.length, 3);
assert.deepStrictEqual(commissions.map((c) => c.referrer_id), ['C', 'B', 'A']);
assert.deepStrictEqual(commissions.map((c) => c.amount), [10, 5, 2]);

console.log('All tests passed');
