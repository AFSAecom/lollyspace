const assert = require('assert');

function filterCommissions(data, { from, to, referrer_id }) {
  return data.filter(c => {
    if (from && c.created_at < from) return false;
    if (to && c.created_at > to) return false;
    if (referrer_id && c.referrer_id !== referrer_id) return false;
    return true;
  });
}

function aggregate(commissions) {
  const map = new Map();
  for (const c of commissions) {
    if (!c.referrer_id) continue;
    map.set(c.referrer_id, (map.get(c.referrer_id) || 0) + c.amount_tnd);
  }
  return Array.from(map.entries()).map(([referrer_id, total_tnd]) => ({ referrer_id, total_tnd }));
}

function exportCsv(aggregates) {
  const header = 'referrer_id,total_tnd';
  const rows = aggregates.map(a => `${a.referrer_id},${a.total_tnd}`);
  return [header, ...rows].join('\n');
}

const dataset = [
  { id: 1, referrer_id: 'A', amount_tnd: 10, created_at: '2024-01-10' },
  { id: 2, referrer_id: 'B', amount_tnd: 20, created_at: '2024-02-05' },
  { id: 3, referrer_id: 'B', amount_tnd: 30, created_at: '2024-03-01' },
];

const filtered = filterCommissions(dataset, { from: '2024-02-01', to: '2024-02-28', referrer_id: 'B' });
assert.strictEqual(filtered.length, 1);

const aggs = aggregate(filtered);
assert.deepStrictEqual(aggs, [{ referrer_id: 'B', total_tnd: 20 }]);

const csv = exportCsv(aggs);
assert(csv.includes('B,20'));

console.log('Commission export integration test passed');
