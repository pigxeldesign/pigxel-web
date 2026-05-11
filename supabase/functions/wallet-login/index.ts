import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import nacl from "https://esm.sh/tweetnacl@1.0.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { publicKey, publicKeyBytesArray, signature, message } = await req.json();

    if (!publicKey || !publicKeyBytesArray || !signature || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify signature
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Uint8Array.from(signature);
    const publicKeyBytes = Uint8Array.from(publicKeyBytesArray);

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const email = `${publicKey}@solana.local`;
    
    // Generate a deterministic, secure password known ONLY to the Edge Function
    const userPassword = btoa(publicKey + supabaseServiceKey).substring(0, 32) + "Wallet1!";

    // Try to sign in with the deterministic password
    let { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: email,
      password: userPassword
    });

    if (signInError || !signInData.session) {
      // User likely doesn't exist yet, let's try to create them
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: userPassword,
        email_confirm: true,
        user_metadata: { wallet_address: publicKey }
      });

      // If the error is that the user already exists, it means they were created in our 
      // previous tests without a password! We just need to update their password.
      if (createError && (createError.message.includes('already exists') || createError.message.includes('already been registered'))) {
        
        // Find their user ID from the profiles table
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('wallet_address', publicKey)
          .limit(1);

        if (profiles && profiles.length > 0) {
          // Force update their password to the deterministic password
          await supabaseAdmin.auth.admin.updateUserById(profiles[0].id, { 
            password: userPassword 
          });
        } else {
          throw new Error("User email registered but wallet profile missing.");
        }
      } else if (createError) {
        throw new Error(`Error creating user: ${createError.message}`);
      }

      // Try signing in again now that the user is created OR their password is updated
      const retrySignIn = await supabaseAdmin.auth.signInWithPassword({
        email: email,
        password: userPassword
      });

      if (retrySignIn.error || !retrySignIn.data.session) {
        throw new Error('Failed to generate session after user creation/update');
      }

      signInData = retrySignIn.data;
    }

    return new Response(JSON.stringify({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      user: {
        id: signInData.user.id,
        email: email,
        wallet_address: publicKey
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Wallet Login Error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Unknown server error' }), {
      status: 200, // Returning 200 so supabase-js doesn't swallow the error message
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
