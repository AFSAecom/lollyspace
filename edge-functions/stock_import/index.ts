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
    const rows = XLSX.utils.sheet_to_json(sheet) as { variant_code: string; stock_qty: number }[];

    await sql.begin(async (tx) => {
      await tx`
        insert into stock_imports (import_date, supplier, bl_number)
        values (${importDate}, ${supplier}, ${blNumber})
      `;
      for (const r of rows) {
        if (!r.variant_code || typeof r.stock_qty !== "number") continue;
        await tx`
          update product_variants
          set stock_qty = ${r.stock_qty}, updated_at = now()
          where variant_code = ${r.variant_code}
        `;
      }
    });

    return new Response(JSON.stringify({ imported: rows.length }), {
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
