import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface SubscribeRequest {
  email: string;
  source?: string;
}

interface RateLimitCheck {
  count: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get request data
    const { email, source = 'website' }: SubscribeRequest = await req.json()
    
    // Get client IP and user agent for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Server-side validation
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check email length
    if (email.length > 254) {
      return new Response(
        JSON.stringify({ error: 'Email address too long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Rate limiting: Check if IP has submitted more than 5 times in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    // Convert IP to proper format for inet type, handle 'unknown' case
    let ipForQuery = clientIP
    if (clientIP === 'unknown' || !clientIP) {
      ipForQuery = '127.0.0.1'
    }
    
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('newsletter_subscribers')
      .select('id', { count: 'exact' })
      .eq('ip_address', ipForQuery)
      .gte('created_at', oneHourAgo)

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError)
    } else if (rateLimitData && rateLimitData.length >= 5) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many subscription attempts. Please try again later.' 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database check error:', checkError)
      return new Response(
        JSON.stringify({ error: 'Database error occurred' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingSubscriber) {
      if (existingSubscriber.is_active) {
        return new Response(
          JSON.stringify({ 
            message: 'You are already subscribed to our newsletter!' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            is_active: true, 
            subscribed_at: new Date().toISOString(),
            source,
            ip_address: ipForQuery,
            user_agent: userAgent
          })
          .eq('id', existingSubscriber.id)

        if (updateError) {
          console.error('Reactivation error:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to reactivate subscription' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            message: 'Welcome back! Your subscription has been reactivated.' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Insert new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert([{
        email: email.toLowerCase(),
        source,
        ip_address: ipForQuery,
        user_agent: userAgent
      }])

    if (insertError) {
      console.error('Insert error:', insertError)
      
      // Handle unique constraint violation
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ 
            message: 'You are already subscribed to our newsletter!' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Failed to subscribe. Please try again.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Success response
    return new Response(
      JSON.stringify({ 
        message: 'Successfully subscribed! We\'ll notify you when new features launch.' 
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})