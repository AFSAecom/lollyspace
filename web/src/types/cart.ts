export interface CartItem {
  product_variant_id: number;
  name: string;
  qty: number;
  unit_price_tnd: number;
  discount_tnd?: number;
}
