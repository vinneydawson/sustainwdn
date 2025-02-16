
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get IP from request headers or body
    let ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('cf-connecting-ip') ||
             req.headers.get('x-real-ip');

    if (!ip) {
      const body = await req.json().catch(() => ({}));
      ip = body.ip;
    }

    if (!ip) {
      throw new Error('No IP address found');
    }

    // Use a reliable geolocation API
    const response = await fetch(`https://ipapi.co/json/`);
    if (!response.ok) {
      throw new Error(`Geolocation API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        country: data.country_code || 'US',
        timezone: data.timezone || 'UTC'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in detect-location function:', error);
    return new Response(
      JSON.stringify({
        country: 'US',
        timezone: 'UTC'
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
})
