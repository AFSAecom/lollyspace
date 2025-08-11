export type PromotionType = 'discount' | 'two_plus_one' | 'pack';

export type PromotionId = number;

export interface PromotionScope {
  genders?: string[];
  families?: string[];
  products?: number[];
  variants?: number[];
}

export interface PromotionItem {
  id?: number;
  product_id?: number | null;
  variant_id?: number | null;
  params?: Record<string, unknown>;
}

export interface Promotion {
  id: PromotionId;
  name: string;
  type: PromotionType;
  active: boolean;
  starts_at: string; // ISO
  ends_at: string;   // ISO
  combinable: boolean;
  priority: number;
  scope: PromotionScope;
  items: PromotionItem[];
}

export type PromotionInput = Omit<Promotion, 'id'> & { id?: PromotionId };
