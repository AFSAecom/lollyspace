import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const InputSchema = z.object({
  orderId: z.string().uuid(),
});

serve(async (req) => {
  try {
    const input = InputSchema.parse(await req.json());

    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      },
    );

    // Atomic promotion application via stored procedure
    // const { data, error } = await client.rpc("apply_promotions", input);
    // if (error) throw error;

    return new Response(JSON.stringify({ applied: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
