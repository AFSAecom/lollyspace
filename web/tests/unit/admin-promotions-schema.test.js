import test from 'node:test';
import assert from 'node:assert';
import { validatePromotionForm, mapFormToPayload } from '../helpers/pages/adminPromotionsSchema.js';

test('rejects missing name', () => {
  const data = {
    name: '',
    type: 'discount',
    combinable: true,
    priority: '1',
    startsAt: '2024-01-01',
    endsAt: '2024-01-02',
    active: true,
    scopeGender: '',
    scopeFamily: '',
    scopeProducts: '',
    scopeVariants: '',
    params: '',
  };
  assert.throws(() => validatePromotionForm(data));
});

test('maps payload', () => {
  const data = {
    name: 'Promo',
    type: 'discount',
    combinable: true,
    priority: '5',
    startsAt: '2024-01-01',
    endsAt: '2024-01-02',
    active: true,
    scopeGender: 'male,female',
    scopeFamily: '',
    scopeProducts: '1,2',
    scopeVariants: '',
    params: '{"percent":10}',
  };
  const payload = mapFormToPayload(data);
  assert.equal(payload.name, 'Promo');
  assert.equal(payload.priority, 5);
  assert.deepStrictEqual(payload.scope.genders, ['male', 'female']);
  assert.deepStrictEqual(payload.scope.products, [1, 2]);
  assert.deepStrictEqual(payload.items[0].params, { percent: 10 });
});
