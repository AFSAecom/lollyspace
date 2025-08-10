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
  q_brand_name = '',
  q_ingredients = '',
  gender,
  season,
  family,
  page = 1,
  page_size = 20,
}) {
  const qb = q_brand_name.toLowerCase();
  const qi = q_ingredients.toLowerCase();
  return products
    .filter((p) => p.active)
    .filter((p) => {
      const nameBrand = `${p.inspired_name} ${p.inspired_brand}`.toLowerCase();
      return !qb || nameBrand.includes(qb);
    })
    .filter((p) => {
      const notes = `${p.top_notes.join(' ')} ${p.heart_notes.join(' ')} ${p.base_notes.join(' ')} ${p.olfactory_family}`.toLowerCase();
      return !qi || notes.includes(qi);
    })
    .filter((p) => !gender || p.gender === gender)
    .filter((p) => !season || p.season === season)
    .filter((p) => !family || p.olfactory_family === family)
    .slice((page - 1) * page_size, page * page_size);
}
const res1 = searchLocal({ q_brand_name: 'woody', q_ingredients: 'vanilla', page: 1, page_size: 20 });
assert.strictEqual(res1.length, 1);
assert.strictEqual(res1[0].id, 3);

const res2 = searchLocal({ q_brand_name: 'citrus', gender: 'unisex', page: 1, page_size: 20 });
assert.strictEqual(res2[0].id, 2);

const res3 = searchLocal({ q_ingredients: 'rose', season: 'spring', family: 'floral', page: 1, page_size: 20 });
assert.strictEqual(res3[0].id, 1);

const pag1 = searchLocal({ page: 1, page_size: 2 });
const pag2 = searchLocal({ page: 2, page_size: 2 });
assert.deepStrictEqual(pag1.map((p) => p.id), [1, 2]);
assert.deepStrictEqual(pag2.map((p) => p.id), [3]);

console.log('search_products tests passed');
