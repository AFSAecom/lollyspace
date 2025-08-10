const assert = require('assert');

function filterCommissions(data, { from, to, referrer_id, status }) {
  return data.filter(c => {
    if (from && c.created_at < from) return false;
    if (to && c.created_at > to) return false;
    if (referrer_id && c.referrer_id !== referrer_id) return false;
    if (status === 'paid' && !c.paid_at) return false;
    if (status === 'unpaid' && c.paid_at) return false;
    return true;
  });
}

function paySelected(data, ids, paid_at) {
  const date = paid_at || '2024-04-01';
  return data.map(c => (ids.includes(c.id) ? { ...c, paid_at: date } : c));
}

function aggregate(commissions) {
  const map = new Map();
  for (const c of commissions) {
    if (!c.referrer_id) continue;
    map.set(c.referrer_id, (map.get(c.referrer_id) || 0) + c.amount_tnd);
  }
  return Array.from(map.entries()).map(([referrer_id, total_tnd]) => ({ referrer_id, total_tnd }));
}

function exportXlsx(aggregates) {
  const header = ['referrer_id', 'total_tnd'];
  const rows = aggregates.map(a => [a.referrer_id, a.total_tnd]);
  return [header, ...rows];
}

const dataset = [
  { id: 1, referrer_id: 'A', amount_tnd: 10, created_at: '2024-01-10', paid_at: null },
  { id: 2, referrer_id: 'B', amount_tnd: 20, created_at: '2024-02-05', paid_at: null },
  { id: 3, referrer_id: 'B', amount_tnd: 30, created_at: '2024-03-01', paid_at: '2024-03-05' },
];

const unpaid = filterCommissions(dataset, { status: 'unpaid' });
assert.strictEqual(unpaid.length, 2);

const paidDataset = paySelected(dataset, unpaid.map(c => c.id));
assert(paidDataset.every(c => c.paid_at));

const aggs = aggregate(paidDataset);
assert.deepStrictEqual(aggs, [
  { referrer_id: 'A', total_tnd: 10 },
  { referrer_id: 'B', total_tnd: 50 },
]);

const sheet = exportXlsx(aggs);
assert.strictEqual(sheet[1][0], 'A');
assert.strictEqual(sheet[2][1], 50);

console.log('Commission export integration test passed');
