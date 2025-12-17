import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, action = 'subscribe' } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const normalizedEmail = email.toLowerCase().trim();

    if (action === 'unsubscribe') {
      console.log('Unsubscribing email:', normalizedEmail);
      
      const { error } = await supabase
        .from('email_subscriptions')
        .update({ is_active: false })
        .eq('email', normalizedEmail);

      if (error) {
        console.error('Error unsubscribing:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to unsubscribe' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Successfully unsubscribed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Subscribe action
    console.log('Subscribing email:', normalizedEmail);

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('email_subscriptions')
      .select('id, is_active')
      .eq('email', normalizedEmail)
      .single();

    if (existing) {
      if (existing.is_active) {
        return new Response(
          JSON.stringify({ success: true, message: 'Already subscribed', alreadySubscribed: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Reactivate subscription
        const { error } = await supabase
          .from('email_subscriptions')
          .update({ is_active: true })
          .eq('id', existing.id);

        if (error) {
          console.error('Error reactivating subscription:', error);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to reactivate subscription' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Subscription reactivated' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create new subscription
    const { error: insertError } = await supabase
      .from('email_subscriptions')
      .insert({ email: normalizedEmail });

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to subscribe' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully subscribed:', normalizedEmail);

    return new Response(
      JSON.stringify({ success: true, message: 'Successfully subscribed to breach alerts' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in subscribe function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
