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
    const { searchQuery } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Searching for breach information:', searchQuery || 'recent data breaches');

    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Firecrawl to search for breach information
    const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery || 'data breach 2024 exposed emails passwords',
        limit: 5,
        scrapeOptions: {
          formats: ['markdown']
        }
      }),
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Firecrawl search error:', searchResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to search for breaches' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchData = await searchResponse.json();
    console.log('Firecrawl search results:', searchData);

    if (!searchData.data || searchData.data.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No new breach information found', breaches: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI to extract structured breach information from search results
    const extractionPrompt = `Analyze the following search results about data breaches and extract structured information about any NEW data breaches mentioned.

Search Results:
${searchData.data.map((r: any, i: number) => `
--- Result ${i + 1} ---
Title: ${r.title || 'N/A'}
URL: ${r.url || 'N/A'}
Content: ${r.markdown?.substring(0, 2000) || r.description || 'N/A'}
`).join('\n')}

Extract any data breaches mentioned and return them as a JSON array:
{
  "breaches": [
    {
      "name": "Company Name",
      "domain": "company.com",
      "breach_date": "YYYY-MM-DD",
      "exposed_data": ["emails", "passwords", "names"],
      "description": "Brief description of the breach",
      "affected_count": "Number affected (e.g., '50M')",
      "severity": "low|medium|high|critical",
      "source_url": "URL where this was reported"
    }
  ]
}

Only include breaches with enough information to be useful. Return an empty array if no clear breach information is found.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a cybersecurity analyst who extracts structured data breach information. Always respond with valid JSON.' },
          { role: 'user', content: extractionPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI extraction failed:', aiResponse.status);
      return new Response(
        JSON.stringify({ success: true, message: 'Found results but could not extract breach data', rawResults: searchData.data.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content;

    let extractedBreaches = [];
    try {
      const jsonMatch = extractedText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        extractedText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : extractedText;
      const parsed = JSON.parse(jsonStr);
      extractedBreaches = parsed.breaches || [];
    } catch (e) {
      console.error('Failed to parse extracted breaches:', e);
    }

    // Insert new breaches into database (avoiding duplicates)
    const insertedBreaches = [];
    for (const breach of extractedBreaches) {
      if (!breach.name || !breach.domain) continue;

      // Check if breach already exists
      const { data: existing } = await supabase
        .from('breaches')
        .select('id')
        .eq('name', breach.name)
        .eq('domain', breach.domain)
        .single();

      if (!existing) {
        const { data: newBreach, error } = await supabase
          .from('breaches')
          .insert({
            name: breach.name,
            domain: breach.domain,
            breach_date: breach.breach_date || new Date().toISOString().split('T')[0],
            exposed_data: breach.exposed_data || [],
            description: breach.description,
            affected_count: breach.affected_count,
            severity: breach.severity || 'medium',
            source_url: breach.source_url,
            is_verified: false
          })
          .select()
          .single();

        if (!error && newBreach) {
          insertedBreaches.push(newBreach);
          console.log('Inserted new breach:', breach.name);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Found ${extractedBreaches.length} breaches, inserted ${insertedBreaches.length} new`,
        breaches: insertedBreaches 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in crawl-breaches function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
