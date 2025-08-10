export type ProductVariant = {
  id: number;
  productId: number;
  sizeMl: number;
  priceTnd: number;
  discountTnd?: number;
  name?: string;
};

// Temporary compatibility alias
export type Variant = ProductVariant;
