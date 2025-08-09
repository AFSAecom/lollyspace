import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import postgres from "https://deno.land/x/postgresjs@v3.3.3/mod.js";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";

const sql = postgres(Deno.env.get("DATABASE_URL")!, { ssl: "require" });

const itemSchema = z.object({
  product_variant_id: z.number().int(),
  quantity: z.number().int().positive(),
  unit_price_tnd: z.number().nonnegative(),
});

const bodySchema = z.object({
  items: z.array(itemSchema),
});

type Item = z.infer<typeof itemSchema> & { discount_tnd: number };

serve(async (req) => {
  try {
    const { items } = bodySchema.parse(await req.json());
    const result: Item[] = items.map((i) => ({ ...i, discount_tnd: 0 }));

    const promotions = await sql`
      select type, condition_json
      from promotions
      where active = true and now() between starts_at and ends_at
    `;

    for (const p of promotions.filter((p: any) => p.type === 'pack')) {
      const ids: number[] = p.condition_json.product_variant_ids || [];
      const price: number = p.condition_json.price;
      const matches = ids.map((id) =>
        result.find((r) => r.product_variant_id === id)
      );
      if (matches.some((m) => !m)) continue;
      const packCount = Math.min(...matches.map((m) => m!.quantity));
      if (packCount <= 0) continue;
      const sumPrice = matches.reduce((s, m) => s + m!.unit_price_tnd, 0);
      const discountPerPack = sumPrice - price;
      const discountPerItem = discountPerPack / ids.length;
      matches.forEach((m) => {
        m!.discount_tnd += (discountPerItem * packCount) / m!.quantity;
      });
    }

    for (const p of promotions.filter((p: any) => p.type === 'two_plus_one')) {
      const id = p.condition_json.product_variant_id;
      const item = result.find((r) => r.product_variant_id === id);
      if (!item) continue;
      const freeCount = Math.floor(item.quantity / 3);
      if (freeCount <= 0) continue;
      const totalDiscount = freeCount * item.unit_price_tnd;
      item.discount_tnd += totalDiscount / item.quantity;
    }

    for (const p of promotions.filter((p: any) => p.type === 'discount')) {
      const id = p.condition_json.product_variant_id;
      const percent = p.condition_json.percent;
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
