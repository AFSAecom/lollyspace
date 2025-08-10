import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import postgres from "https://deno.land/x/postgresjs@v3.3.3/mod.js";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";

const sql = postgres(Deno.env.get("DATABASE_URL")!, { ssl: "require" });

const itemSchema = z.object({
  product_variant_id: z.number().int(),
  qty: z.number().int().positive(),
  unit_price_tnd: z.number().nonnegative(),
});

const bodySchema = z.object({
  items: z.array(itemSchema),
});

type Item = z.infer<typeof itemSchema> & { discount_tnd: number };

const discountConditionSchema = z.object({
  product_variant_id: z.number().int(),
  percent: z.number().nonnegative(),
});

const twoPlusOneConditionSchema = z.union([
  z.object({ product_variant_id: z.number().int() }),
  z.object({
    product_variant_ids: z.array(z.number().int()).min(1),
    price_diff_tnd: z.number().nonnegative().optional(),
  }),
]);

const packConditionSchema = z.object({
  product_variant_ids: z.array(z.number().int()).min(1),
  price: z.number().nonnegative(),
});

type DiscountCondition = z.infer<typeof discountConditionSchema>;
type TwoPlusOneCondition = z.infer<typeof twoPlusOneConditionSchema>;
type PackCondition = z.infer<typeof packConditionSchema>;

serve(async (req) => {
  try {
    const { items } = bodySchema.parse(await req.json());
    const result: Item[] = items.map((i) => ({ ...i, discount_tnd: 0 }));

    const rawPromotions = await sql`
      select type, condition_json
      from promotions
      where active = true and now() between starts_at and ends_at
    `;

    const promotions = rawPromotions.map((p: any) => {
      switch (p.type) {
        case 'pack':
          return { type: 'pack', condition: packConditionSchema.parse(p.condition_json) } as const;
        case 'two_plus_one':
          return { type: 'two_plus_one', condition: twoPlusOneConditionSchema.parse(p.condition_json) } as const;
        case 'discount':
          return { type: 'discount', condition: discountConditionSchema.parse(p.condition_json) } as const;
        default:
          return null;
      }
    }).filter((p: any): p is Promotion => Boolean(p));

    type Promotion =
      | { type: 'pack'; condition: PackCondition }
      | { type: 'two_plus_one'; condition: TwoPlusOneCondition }
      | { type: 'discount'; condition: DiscountCondition };

    for (const p of promotions.filter((p) => p.type === 'pack')) {
      const ids = p.condition.product_variant_ids || [];
      const price = p.condition.price;
      const matches = ids.map((id) =>
        result.find((r) => r.product_variant_id === id)
      );
      if (matches.some((m) => !m)) continue;
      const packCount = Math.min(...matches.map((m) => m!.qty));
      if (packCount <= 0) continue;
      const sumPrice = matches.reduce((s, m) => s + m!.unit_price_tnd, 0);
      const discountPerPack = sumPrice - price;
      const discountPerItem = discountPerPack / ids.length;
      matches.forEach((m) => {
        m!.discount_tnd += (discountPerItem * packCount) / m!.qty;
      });
    }

    for (const p of promotions.filter((p) => p.type === 'two_plus_one')) {
      const c = p.condition;
      if ('product_variant_id' in c) {
        const item = result.find((r) => r.product_variant_id === c.product_variant_id);
        if (!item) continue;
        const freeCount = Math.floor(item.qty / 3);
        if (freeCount <= 0) continue;
        const totalDiscount = freeCount * item.unit_price_tnd;
        item.discount_tnd += totalDiscount / item.qty;
      } else {
        const ids = c.product_variant_ids || [];
        const maxDiff = c.price_diff_tnd ?? 0;
        const units: Item[] = [];
        for (const item of result.filter((r) => ids.includes(r.product_variant_id))) {
          for (let i = 0; i < item.qty; i++) units.push(item);
        }
        units.sort((a, b) => b.unit_price_tnd - a.unit_price_tnd);
        while (units.length >= 3) {
          const group = units.slice(0, 3);
          const diff = group[0].unit_price_tnd - group[2].unit_price_tnd;
          if (diff <= maxDiff) {
            const cheapest = group[2];
            cheapest.discount_tnd += cheapest.unit_price_tnd / cheapest.qty;
            units.splice(0, 3);
          } else {
            units.shift();
          }
        }
      }
    }

    for (const p of promotions.filter((p) => p.type === 'discount')) {
      const id = p.condition.product_variant_id;
      const percent = p.condition.percent;
      const item = result.find((r) => r.product_variant_id === id);
      if (!item) continue;
      item.discount_tnd += item.unit_price_tnd * (percent / 100);
    }

    return new Response(JSON.stringify({ items: result }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof z.ZodError ? err.errors : err.message;
    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
