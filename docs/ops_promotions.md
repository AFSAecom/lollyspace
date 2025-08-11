# Operations: Promotions

This guide outlines how to manage automatic promotions when `PROMO_V2_ENABLED` is active.

## Creating a Promotion

1. Sign in to the admin panel and navigate to **Marketing → Promotions**.
2. Choose **New Promotion** and select a type:
   - **PERCENT** – percentage discount per item.
   - **FIXED** – fixed amount discount per unit.
   - **BxGy** – buy *X* items and get *Y* free.
   - **PACK3** – fixed price for a specific set of three products.
3. Specify the product or product list and the discount details.
4. Optionally set start/end dates and minimum or maximum quantities.
5. Save; the promotion becomes active immediately when the feature flag is enabled.

## Editing a Promotion

1. In the promotions list, select the promotion to edit.
2. Adjust fields such as dates, quantities or discount values.
3. Save changes or disable the promotion if it should no longer apply.

## Managing Priorities

- Promotions do not stack. For each item or pack, the engine automatically applies the promotion that yields the largest discount.
- To influence which promotion wins, adjust discount amounts or disable conflicting promos.
- Start and end dates also control precedence; expired promotions are ignored.

## Limitations

- Requires `PROMO_V2_ENABLED` (and `VITE_PROMO_V2_ENABLED` for the web client).
- `PACK3` supports exactly three products per pack.
- Quantity limits are evaluated per item; cross-cart thresholds are not supported.
- Changes to promotions affect new checkouts only and do not retroactively modify completed orders.

Keep this document updated as promotion capabilities evolve.
