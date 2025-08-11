import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import AdvisorCart from '@/pages/AdvisorCart';
import { useCartStore } from '@/stores/cart';

// Reset cart store before each test
beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe('cart promo mapping', () => {
  it('rounds discounted prices and displays savings', () => {
    useCartStore.setState({
      items: [
        {
          product_variant_id: 1,
          name: 'Test',
          qty: 2,
          unit_price_tnd: 1,
          discount_tnd: 0.333333,
        },
      ],
    });

    const html = renderToString(<AdvisorCart />);
    expect(html).toContain('0.667 TND');
    expect(html).toContain('-0.667 TND');
  });
});
