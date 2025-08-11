import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import postgres from "https://deno.land/x/postgresjs@v3.3.3/mod.js";
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";

const sql = postgres(Deno.env.get("DATABASE_URL")!, { ssl: "require" });

const scopeSchema = z.object({
  genders: z.array(z.string()).optional(),
  families: z.array(z.string()).optional(),
  products: z.array(z.number().int()).optional(),
  variants: z.array(z.number().int()).optional(),
});

const itemSchema = z.object({
  id: z.number().int().optional(),
  product_id: z.number().int().nullable().optional(),
  variant_id: z.number().int().nullable().optional(),
  params: z.record(z.any()).optional().default({}),
});

const promoSchema = z.object({
  id: z.number().int().optional(),
  name: z.string(),
  type: z.enum(["discount", "two_plus_one", "pack"]),
  combinable: z.boolean(),
  priority: z.number().int(),
  starts_at: z.string(),
  ends_at: z.string(),
  active: z.boolean(),
  scope: scopeSchema,
  items: z.array(itemSchema).default([]),
});

type PromoInput = z.infer<typeof promoSchema>;

serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/admin_promotions/, "");
  const parts = path.split("/").filter(Boolean);
  const id = parts[0] ? Number(parts[0]) : undefined;
  const action = parts[1];

  try {
    if (req.method === "GET" && parts.length === 0) {
      const rows = await sql<PromoInput[]>`
        select p.id, p.name, p.type, p.combinable, p.priority, p.starts_at, p.ends_at, p.active, p.scope_json as scope,
          coalesce(json_agg(json_build_object(
            'id', pi.id,
            'product_id', pi.product_id,
            'variant_id', pi.variant_id,
            'params', pi.params_json
          )) filter (where pi.id is not null), '[]') as items
        from promotions p
        left join promotion_items pi on pi.promotion_id = p.id
        group by p.id
        order by p.id`;
      const promos = rows.map((r) => promoSchema.parse(r));
      return new Response(JSON.stringify(promos), { status: 200, headers: {"Content-Type": "application/json"}});
    }

    if (req.method === "POST" && parts.length === 0) {
      const payload = promoSchema.omit({ id: true }).parse(await req.json());
      const [inserted] = await sql<any[]>`
        insert into promotions (name, type, combinable, priority, starts_at, ends_at, active, scope_json)
        values (${payload.name}, ${payload.type}, ${payload.combinable}, ${payload.priority}, ${payload.starts_at}, ${payload.ends_at}, ${payload.active}, ${payload.scope})
        returning id`;
      const promoId = inserted.id as number;
      for (const item of payload.items) {
        await sql`
          insert into promotion_items (promotion_id, product_id, variant_id, params_json)
          values (${promoId}, ${item.product_id ?? null}, ${item.variant_id ?? null}, ${item.params})`;
      }
      return new Response(JSON.stringify({ ...payload, id: promoId }), { status: 201, headers: {"Content-Type": "application/json"}});
    }

    if (req.method === "PUT" && id) {
      const payload = promoSchema.omit({ id: true }).parse(await req.json());
      await sql`
        update promotions set name=${payload.name}, type=${payload.type}, combinable=${payload.combinable}, priority=${payload.priority},
          starts_at=${payload.starts_at}, ends_at=${payload.ends_at}, active=${payload.active}, scope_json=${payload.scope}
        where id=${id}`;
      await sql`delete from promotion_items where promotion_id=${id}`;
      for (const item of payload.items) {
        await sql`
          insert into promotion_items (promotion_id, product_id, variant_id, params_json)
          values (${id}, ${item.product_id ?? null}, ${item.variant_id ?? null}, ${item.params})`;
      }
      return new Response(JSON.stringify({ ...payload, id }), { status: 200, headers: {"Content-Type": "application/json"}});
    }

    if (req.method === "PATCH" && id && action === "active") {
      const { active } = z.object({ active: z.boolean() }).parse(await req.json());
      await sql`update promotions set active=${active} where id=${id}`;
      return new Response(JSON.stringify({ id, active }), { status: 200, headers: {"Content-Type": "application/json"}});
    }

    if (req.method === "DELETE" && id) {
      await sql`delete from promotions where id=${id}`;
      return new Response(null, { status: 204 });
    }

    return new Response("Not found", { status: 404 });
  } catch (err) {
    const message = err instanceof z.ZodError ? err.errors : err.message;
    return new Response(JSON.stringify({ error: message }), { status: 400, headers: {"Content-Type": "application/json"}});
  }
});

