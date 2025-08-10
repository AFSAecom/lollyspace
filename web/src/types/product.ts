export type ProductVariant = {
  id: number;
  product_id: number;
  size_ml: number;
  price_tnd: number;
  discount_tnd?: number;
  name?: string;
};

// Temporary compatibility alias
export type Variant = ProductVariant;
