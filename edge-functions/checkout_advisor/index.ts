import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";
import postgres from "https://deno.land/x/postgresjs@v3.3.3/mod.js";

const sql = postgres(Deno.env.get("DATABASE_URL")!, { ssl: "require" });

const itemSchema = z.object({
  product_variant_id: z.number().int(),
  quantity: z.number().int().positive(),
  unit_price_tnd: z.number().nonnegative(),
  discount_tnd: z.number().nonnegative().optional().default(0),
});

const bodySchema = z.object({
  advisor_id: z.string().uuid(),
  client: z.union([
    z.object({ id: z.string().uuid() }),
    z.object({
      first_name: z.string(),
      last_name: z.string(),
      phone: z.string(),
    }),
  ]),
  items: z.array(itemSchema).min(1),
});

serve(async (req) => {
  try {
    const payload = await req.json();
    const data = bodySchema.parse(payload);

    const promoRes = await fetch(
      new URL('/apply_promotions', req.url).toString(),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: data.items }),
      },
    );
    if (!promoRes.ok) {
      throw new Error(await promoRes.text());
    }
    const { items } = (await promoRes.json()) as {
      items: z.infer<typeof itemSchema>[];
    };

    const total = items.reduce(
      (sum: number, i: any) =>
        sum + (i.unit_price_tnd - (i.discount_tnd ?? 0)) * i.quantity,
      0,
    );
    const code = crypto.randomUUID();

    const result = await sql.begin(async (tx) => {
      let clientId: string;
      if ("id" in data.client) {
        clientId = data.client.id;
      } else {
        const inserted = await tx`
          insert into profiles (role, first_name, last_name, phone)
          values ('client', ${data.client.first_name}, ${data.client.last_name}, ${data.client.phone})
          returning id
        `;
        clientId = inserted[0].id;
      }

      const order = await tx`
        insert into orders (order_code, user_id, advisor_id, total_tnd)
        values (${code}, ${clientId}, ${data.advisor_id}, ${total})
        returning id
      `;
      const orderId = order[0].id;

      for (const item of items) {
        await tx`
          insert into order_items (order_id, product_variant_id, quantity, unit_price_tnd, discount_tnd)
          values (${orderId}, ${item.product_variant_id}, ${item.quantity}, ${item.unit_price_tnd}, ${item.discount_tnd ?? 0})
        `;
      }

      return { order_id: orderId, order_code: code, client_id: clientId };
    });

    return new Response(JSON.stringify(result), {
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
