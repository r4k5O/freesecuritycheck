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
    const { breachId } = await req.json();

    if (!breachId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Breach ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Generating blog post for breach:', breachId);

    // Fetch breach details
    const { data: breach, error: breachError } = await supabase
      .from('breaches')
      .select('*')
      .eq('id', breachId)
      .single();

    if (breachError || !breach) {
      console.error('Breach not found:', breachError);
      return new Response(
        JSON.stringify({ success: false, error: 'Breach not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if blog post already exists
    const { data: existingPost } = await supabase
      .from('blog_posts')
      .select('id, slug')
      .eq('breach_id', breachId)
      .single();

    if (existingPost) {
      return new Response(
        JSON.stringify({ success: true, message: 'Blog post already exists', slug: existingPost.slug }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate blog content using Lovable AI
    const prompt = `You are a cybersecurity expert writing a detailed blog post about a data breach.

Write a comprehensive article about the following data breach:

**Breach Name:** ${breach.name}
**Domain:** ${breach.domain}
**Breach Date:** ${breach.breach_date}
**Affected Users:** ${breach.affected_count || 'Unknown'}
**Exposed Data Types:** ${breach.exposed_data?.join(', ') || 'Unknown'}
**Description:** ${breach.description || 'No description available'}
**Severity:** ${breach.severity}

Your article should include:
1. An engaging introduction explaining what happened
2. How the breach occurred (attack vector analysis)
3. What data was exposed and the potential risks
4. Impact assessment for affected users
5. Security recommendations for users

Format your response as JSON with this structure:
{
  "title": "Engaging article title",
  "excerpt": "A brief 2-3 sentence summary for previews",
  "content": "Full markdown article content with headers (use ## for h2, ### for h3)",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4", "recommendation 5"],
  "sources": ["https://example.com/source1"],
  "readTime": "X min read"
}

Make the content informative, factual, and actionable. Use a professional but accessible tone.`;

    console.log('Calling Lovable AI for content generation...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a cybersecurity expert who writes detailed, accurate breach reports. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices?.[0]?.message?.content;

    if (!generatedText) {
      console.error('No content generated');
      return new Response(
        JSON.stringify({ success: false, error: 'No content generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let blogContent;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = generatedText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        generatedText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : generatedText;
      blogContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Create a basic blog post from the raw content
      blogContent = {
        title: `${breach.name} Data Breach Analysis`,
        excerpt: `Analysis of the ${breach.name} data breach affecting ${breach.affected_count || 'millions of'} users.`,
        content: generatedText,
        recommendations: [
          'Change your password immediately',
          'Enable two-factor authentication',
          'Monitor your accounts for suspicious activity',
          'Use unique passwords for each service',
          'Consider using a password manager'
        ],
        sources: [],
        readTime: '5 min read'
      };
    }

    // Generate slug
    const slug = `${breach.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${breach.breach_date?.split('-')[0] || 'breach'}`;

    // Save blog post to database
    const { data: newPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert({
        slug,
        breach_id: breachId,
        title: blogContent.title,
        excerpt: blogContent.excerpt,
        content: blogContent.content,
        exposed_data: breach.exposed_data || [],
        recommendations: blogContent.recommendations || [],
        sources: blogContent.sources || [],
        read_time: blogContent.readTime || '5 min read',
        is_published: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving blog post:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save blog post' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Blog post created successfully:', slug);

    return new Response(
      JSON.stringify({ success: true, slug: newPost.slug, post: newPost }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-blog function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
