const assert = require('assert');

const products = [
  {
    id: 1,
    inspired_name: 'Floral Breeze',
    inspired_brand: 'BrandA',
    gender: 'female',
    season: 'spring',
    olfactory_family: 'floral',
    top_notes: ['rose'],
    heart_notes: ['jasmine'],
    base_notes: ['musk'],
    active: true,
  },
  {
    id: 2,
    inspired_name: 'Citrus Splash',
    inspired_brand: 'BrandB',
    gender: 'unisex',
    season: 'summer',
    olfactory_family: 'citrus',
    top_notes: ['orange'],
    heart_notes: ['lemon'],
    base_notes: ['amber'],
    active: true,
  },
  {
    id: 3,
    inspired_name: 'Woody Night',
    inspired_brand: 'BrandC',
    gender: 'male',
    season: 'winter',
    olfactory_family: 'woody',
    top_notes: ['cedar'],
    heart_notes: ['patchouli'],
    base_notes: ['vanilla'],
    active: true,
  },
];

function searchLocal({
  query_name_brand = '',
  query_notes = '',
  gender,
  season,
  family,
  page = 1,
  per_page = 20,
}) {
  const qb = query_name_brand.toLowerCase();
  const qn = query_notes.toLowerCase();
  return products
    .filter((p) => p.active)
    .filter((p) => {
      const nameBrand = `${p.inspired_name} ${p.inspired_brand}`.toLowerCase();
      return !qb || nameBrand.includes(qb);
    })
    .filter((p) => {
      const notes = `${p.top_notes.join(' ')} ${p.heart_notes.join(' ')} ${p.base_notes.join(' ')} ${p.olfactory_family}`.toLowerCase();
      return !qn || notes.includes(qn);
    })
    .filter((p) => !gender || p.gender === gender)
    .filter((p) => !season || p.season === season)
    .filter((p) => !family || p.olfactory_family === family)
    .slice((page - 1) * per_page, page * per_page);
}

const res1 = searchLocal({ query_name_brand: 'woody', query_notes: 'vanilla', page: 1, per_page: 20 });
assert.strictEqual(res1.length, 1);
assert.strictEqual(res1[0].id, 3);

const res2 = searchLocal({ query_name_brand: 'citrus', page: 1, per_page: 20 });
assert.strictEqual(res2[0].id, 2);

const pag1 = searchLocal({ page: 1, per_page: 2 });
const pag2 = searchLocal({ page: 2, per_page: 2 });
assert.deepStrictEqual(pag1.map((p) => p.id), [1, 2]);
assert.deepStrictEqual(pag2.map((p) => p.id), [3]);

console.log('search_products tests passed');
