export type PromotionType = 'discount' | '2+1' | 'pack';

export type PromotionId = string;

export interface Promotion {
  id: PromotionId;
  name: string;
  type: PromotionType;
  active: boolean;
  startsAt?: string; // ISO
  endsAt?: string;   // ISO
  percentOff?: number;    // pour discount
  packSize?: number;      // pour pack
}
