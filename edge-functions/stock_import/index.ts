import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import postgres from "https://deno.land/x/postgresjs@v3.3.3/mod.js";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

const sql = postgres(Deno.env.get("DATABASE_URL")!, { ssl: "require" });

serve(async (req) => {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const importDate = form.get("date");
    const supplier = form.get("supplier");
    const blNumber = form.get("bl_number");

    if (
      !(file instanceof File) ||
      typeof importDate !== "string" ||
      typeof supplier !== "string" ||
      typeof blNumber !== "string"
    ) {
      return new Response(JSON.stringify({ error: "Invalid form data" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const array = await file.arrayBuffer();
    const workbook = XLSX.read(array, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as {
      variant_code: string;
      stock_qty: number;
    }[];

    let success = 0;
    let failure = 0;

    await sql.begin(async (tx) => {
      const [log] = await tx`
        insert into stock_import_logs (import_date, supplier, bl_number, success_count, failure_count)
        values (${importDate}, ${supplier}, ${blNumber}, 0, 0)
        returning id
      `;
      const logId = log.id as number;

      for (const r of rows) {
        if (!r.variant_code || typeof r.stock_qty !== "number") {
          failure++;
          continue;
        }
        try {
          const variant = await tx`
            select id, stock_qty
            from product_variants
            where variant_code = ${r.variant_code}
          `;
          if (variant.length === 0) {
            failure++;
            continue;
          }
          const variantId = variant[0].id as number;
          const oldQty = variant[0].stock_qty as number;

          await tx`
            update product_variants
            set stock_qty = ${r.stock_qty}, updated_at = now()
            where id = ${variantId}
          `;

          await tx`
            insert into variant_stocks (product_variant_id, qty)
            values (${variantId}, ${r.stock_qty})
            on conflict (product_variant_id) do update set qty = excluded.qty, updated_at = now()
          `;

          const delta = r.stock_qty - oldQty;
          if (delta !== 0) {
            await tx`
              insert into stock_adjustments (product_variant_id, qty_delta, stock_import_log_id)
              values (${variantId}, ${delta}, ${logId})
            `;
          }
          success++;
        } catch (_) {
          failure++;
        }
      }

      await tx`
        update stock_import_logs
        set success_count = ${success}, failure_count = ${failure}
        where id = ${logId}
      `;
    });

    return new Response(JSON.stringify({ imported: success, failed: failure }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
