const assert = require('assert');

function rpc_activate_seed(profile) {
  profile.seed_code = profile.id;
  profile.seed_activated_at = new Date();
  return profile.seed_code;
}

function rpc_set_referrer(seed_code, client, profiles) {
  const ref = profiles.find((p) => p.seed_code === seed_code);
  if (!ref) throw new Error('Invalid seed code');
  let cur = ref;
  for (let i = 0; i < 3; i++) {
    if (!cur) break;
    if (cur.id === client.id) throw new Error('Cycle detected');
    cur = profiles.find((p) => p.id === cur.referrer_id);
  }
  client.referrer_id = ref.id;
  return ref.id;
}

function compute_commissions(order, profiles, rules) {
  const getProfile = (id) => profiles.find((p) => p.id === id);
  const l1 = getProfile(order.user_id)?.referrer_id;
  const l2 = getProfile(l1)?.referrer_id;
  const l3 = getProfile(l2)?.referrer_id;
  const refs = [l1, l2, l3];
  const commissions = [];
  refs.forEach((r, idx) => {
    if (r) {
      const level = idx + 1;
      const rule =
        rules.find((rr) => rr.level === level && rr.referrer_id === r) ||
        rules.find((rr) => rr.level === level && rr.referrer_id == null);
      const rate = rule ? rule.rate : 0;
      commissions.push({
        referrer_id: r,
        level,
        amount: order.total_tnd * rate,
      });
    }
  });
  return commissions;
}

const profiles = [
  { id: 'A', referrer_id: null },
  { id: 'B', referrer_id: 'A' },
  { id: 'C', referrer_id: 'B' },
];
profiles.forEach((p) => rpc_activate_seed(p));

const client = { id: 'D', referrer_id: null };
rpc_activate_seed(client);
rpc_set_referrer('C', client, profiles);

const order = { id: 1, user_id: client.id, total_tnd: 100 };

const rules = [
  { level: 1, rate: 0.1, referrer_id: null },
  { level: 2, rate: 0.05, referrer_id: null },
  { level: 3, rate: 0.02, referrer_id: null },
];

const commissions = compute_commissions(order, profiles.concat(client), rules);

assert.ok(client.seed_code);
assert.ok(client.seed_activated_at);
assert.strictEqual(client.referrer_id, 'C');
assert.strictEqual(commissions.length, 3);
assert.deepStrictEqual(commissions.map((c) => c.referrer_id), ['C', 'B', 'A']);
assert.deepStrictEqual(commissions.map((c) => c.amount), [10, 5, 2]);

rules.push({ level: 1, rate: 0.2, referrer_id: 'C' });
const commissionsOverride = compute_commissions(order, profiles.concat(client), rules);
assert.deepStrictEqual(
  commissionsOverride.map((c) => c.amount),
  [20, 5, 2],
);

console.log('All tests passed');
