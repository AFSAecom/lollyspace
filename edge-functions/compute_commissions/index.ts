import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";
import postgres from "https://deno.land/x/postgresjs@v3.3.3/mod.js";

const sql = postgres(Deno.env.get("DATABASE_URL")!, { ssl: "require" });

const bodySchema = z.object({
  order_id: z.number().int(),
});

serve(async (req) => {
  try {
    const { order_id } = bodySchema.parse(await req.json());

    const order = await sql`
      select o.id, o.user_id as referee_id, o.advisor_id as l1, o.total_tnd,
             p.referrer_id as l2, p2.referrer_id as l3
      from orders o
      left join profiles p on p.id = o.advisor_id
      left join profiles p2 on p2.id = p.referrer_id
      where o.id = ${order_id}
    `;
    if (order.length === 0) {
      throw new Error("Order not found");
    }

    const data = order[0];
    const referrers = [data.l1, data.l2, data.l3];
    const rates = [0.1, 0.05, 0.02];

    await sql.begin(async (tx) => {
      for (let i = 0; i < 3; i++) {
        const referrer = referrers[i];
        if (referrer) {
          await tx`
            insert into commissions (referrer_id, referee_id, order_id, level, amount_tnd)
            values (${referrer}, ${data.referee_id}, ${order_id}, ${i + 1}, ${
              data.total_tnd * rates[i]
            })
          `;
        }
      }
    });

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof z.ZodError ? err.errors : err.message;
    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});

