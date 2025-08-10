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
    const referrerIds = referrers.filter((r) => r) as string[];

    const globalRules = await sql`
      select level, rate from commission_rules where referrer_id is null
    `;
    const overrideRules = referrerIds.length
      ? await sql`
          select level, rate, referrer_id
          from commission_rules
          where referrer_id in (${sql(referrerIds)})
        `
      : [];

    const globalMap = new Map<number, number>();
    for (const r of globalRules) {
      globalMap.set(r.level, Number(r.rate));
    }

    const overrideMap = new Map<string, Map<number, number>>();
    for (const r of overrideRules) {
      const key = r.referrer_id as string;
      const lvlMap = overrideMap.get(key) || new Map<number, number>();
      lvlMap.set(r.level, Number(r.rate));
      overrideMap.set(key, lvlMap);
    }

    await sql.begin(async (tx) => {
      for (let i = 0; i < 3; i++) {
        const referrer = referrers[i];
        if (referrer) {
          const level = i + 1;
          const rate =
            overrideMap.get(referrer)?.get(level) ??
            globalMap.get(level) ??
            0;
          await tx`
            insert into commissions (referrer_id, referee_id, order_id, level, amount_tnd)
            values (${referrer}, ${data.referee_id}, ${order_id}, ${level}, ${
              data.total_tnd * rate
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

