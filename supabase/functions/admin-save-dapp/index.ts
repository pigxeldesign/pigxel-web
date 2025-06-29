import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Supabase connection details from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Supabase credentials not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Supabase client with admin privileges
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request data
    const requestData = await req.json();
    const { dapp, operation = "INSERT" } = requestData;

    if (!dapp) {
      return new Response(
        JSON.stringify({ error: "No dApp data provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Add log of the request
    await supabase.from("dapp_operation_logs").insert([
      {
        operation_type: "EDGE_FUNCTION_REQUEST",
        dapp_id: dapp.id,
        data: {
          request_data: dapp,
          operation,
          timestamp: new Date().toISOString(),
        },
      },
    ]);

    // Process the request
    let result;
    if (operation === "INSERT") {
      // Add required fields if missing
      const preparedDapp = {
        ...dapp,
        blockchains: dapp.blockchains || [],
        is_new: dapp.is_new ?? false,
        is_featured: dapp.is_featured ?? false,
      };

      const { data, error } = await supabase
        .from("dapps")
        .insert([preparedDapp])
        .select();

      if (error) {
        throw new Error(`Insert failed: ${error.message}`);
      }

      result = { success: true, operation, data, id: data?.[0]?.id };
    } else if (operation === "UPDATE") {
      // Validate that ID is present for update
      if (!dapp.id) {
        throw new Error("ID is required for update operation");
      }

      // Prepare update data
      const { id, ...updateData } = dapp;
      
      const { data, error } = await supabase
        .from("dapps")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(`Update failed: ${error.message}`);
      }

      result = { success: true, operation, data, id };
    } else {
      throw new Error(`Invalid operation: ${operation}`);
    }

    // Log the successful result
    await supabase.from("dapp_operation_logs").insert([
      {
        operation_type: "EDGE_FUNCTION_SUCCESS",
        dapp_id: dapp.id,
        data: {
          result,
          timestamp: new Date().toISOString(),
        },
      },
    ]);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in admin-save-dapp:", error);

    // Try to log the error if possible
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase.from("dapp_operation_logs").insert([
          {
            operation_type: "EDGE_FUNCTION_ERROR",
            data: {
              error: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString(),
            },
          },
        ]);
      }
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});