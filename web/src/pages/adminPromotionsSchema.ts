import { PromotionInput, PromotionType } from '@/types/promotion';

export interface PromotionFormValues {
  id?: number;
  name: string;
  type: PromotionType;
  combinable: boolean;
  priority: string; // keep as string in form
  startsAt: string;
  endsAt: string;
  active: boolean;
  scopeGender: string;
  scopeFamily: string;
  scopeProducts: string;
  scopeVariants: string;
  params: string;
}

export function validatePromotionForm(v: PromotionFormValues): void {
  if (!v.name) throw new Error('name');
  if (!['discount', 'two_plus_one', 'pack'].includes(v.type)) throw new Error('type');
  if (!v.startsAt || !v.endsAt) throw new Error('period');
}

function csv(str: string): string[] | undefined {
  const arr = str.split(',').map((s) => s.trim()).filter(Boolean);
  return arr.length ? arr : undefined;
}

function csvNum(str: string): number[] | undefined {
  const arr = str
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !Number.isNaN(n));
  return arr.length ? arr : undefined;
}

export function mapFormToPayload(v: PromotionFormValues): PromotionInput {
  validatePromotionForm(v);
  return {
    id: v.id,
    name: v.name,
    type: v.type,
    combinable: v.combinable,
    priority: Number(v.priority || 0),
    starts_at: new Date(v.startsAt).toISOString(),
    ends_at: new Date(v.endsAt).toISOString(),
    active: v.active,
    scope: {
      genders: csv(v.scopeGender),
      families: csv(v.scopeFamily),
      products: csvNum(v.scopeProducts),
      variants: csvNum(v.scopeVariants),
    },
    items: v.params ? [{ params: JSON.parse(v.params) }] : [],
  };
}
