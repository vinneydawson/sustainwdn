
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const geoResponse = await fetch('https://ipapi.co/json/')
    if (!geoResponse.ok) throw new Error('Geolocation API error')
    
    const data = await geoResponse.json()
    
    return new Response(JSON.stringify({
      country: data.country_code || 'US',
      timezone: data.timezone || 'UTC'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      country: 'US',
      timezone: 'UTC'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
