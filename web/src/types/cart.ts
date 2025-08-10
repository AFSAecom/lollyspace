export interface CartItem {
  id: number;
  name: string;
  product_variant_id: number;
  price_tnd: number;
  discount_tnd?: number;
}
