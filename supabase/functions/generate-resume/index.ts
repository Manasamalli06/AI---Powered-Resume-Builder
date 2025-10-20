import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, existingResume } = await req.json();
    console.log('Generating resume with prompt:', prompt);
    console.log('Existing resume:', existingResume ? 'Yes' : 'No');

    const AI_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!AI_API_KEY) {
      throw new Error('AI_API_KEY is not configured');
    }

    const systemPrompt = existingResume 
      ? `You are an expert resume writer. The user has an existing resume and wants to make changes to it. 
      
Here is their current resume:
${JSON.stringify(existingResume, null, 2)}

Based on their edit request, update the resume accordingly. Return the COMPLETE updated resume in the same JSON format.`
      : `You are an expert resume writer. Generate a professional, ATS-friendly resume based on the user's requirements.

Return the resume as a JSON object with this structure:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedIn": "string (optional)",
    "portfolio": "string (optional)"
  },
  "summary": "Professional summary paragraph",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "startDate": "string",
      "endDate": "string or 'Present'",
      "responsibilities": ["string", "string", ...]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "string",
      "gpa": "string (optional)"
    }
  ],
  "skills": {
    "technical": ["string", ...],
    "soft": ["string", ...]
  },
  "certifications": ["string", ...] (optional),
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string", ...],
      "link": "string (optional)"
    }
  ] (optional)
}

Make the content realistic, professional, and tailored to the user's requirements. Use proper formatting and strong action verbs.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('AI response received:', generatedContent.substring(0, 100));

    // Parse the JSON from the AI response
    let resumeData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      resumeData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Failed to parse resume data from AI response');
    }

    return new Response(
      JSON.stringify({ resumeData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-resume function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});