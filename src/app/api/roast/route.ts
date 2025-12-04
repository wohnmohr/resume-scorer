import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

interface RoastRequest {
  text: string;
}

interface RoastResult {
  isRoastable: boolean;
  roast?: string;
  roastLevel: 'mild' | 'medium' | 'spicy' | 'inferno';
  reasons: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { text }: RoastRequest = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    // Get current date to help the model understand what "today" is
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const systemPrompt = `You are a brutally honest but constructive resume critic with a sharp wit. Your job is to determine if a resume is "roastable" (has significant issues that warrant humorous criticism) and if so, provide a roast.
The input data will be raw resume text. Please analyze the resume text and determine if it is roastable.
IMPORTANT: Today's date is ${currentDate}. When analyzing dates in the resume, use this as the reference point. Dates before this date are in the past, and dates after this date are in the future.

ROASTABLE CRITERIA (resume must have at least 2 of these):
- Terrible formatting (inconsistent fonts, poor spacing, walls of text)
- Obvious spelling/grammar errors
- Vague, meaningless buzzwords without substance
- Missing key information (contact details, dates, etc.)
- Overly long (3+ pages for entry level)
- Unprofessional email addresses
- Inappropriate content (personal info, photos, etc.)
- Generic objective statements
- No quantifiable achievements
- Poor structure (chronological issues, etc.)

If roastable, provide a roast that is:
- Humorous but not mean-spirited
- Constructive (points out real issues)
- Professional (no personal attacks)
- Educational (explains why things are wrong)
- Appropriate for professional context

Return your response as a JSON object with this exact structure:
{
  "isRoastable": [true/false],
  "roast": "[if roastable, provide a humorous but constructive roast]",
  "roastLevel": "[mild/medium/spicy/inferno]",
  "reasons": ["reason1", "reason2", "reason3"]
}

Roast levels:
- mild: Minor issues, gentle humor
- medium: Some significant problems, moderate humor  
- spicy: Multiple major issues, sharp humor
- inferno: Complete disaster, maximum roast energy

Be funny but helpful. The goal is to make them laugh while learning what's wrong.`;

    const completion = await openai.chat.completions.create({
      model: 'tngtech/deepseek-r1t2-chimera:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please analyze this resume for roastability:\n\n${text}` }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let roastResult: RoastResult;
    try {
      console.log('Roast response:', responseText);
      roastResult = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid response format from AI');
    }

    // Validate the response structure
    if (typeof roastResult.isRoastable !== 'boolean' || !Array.isArray(roastResult.reasons)) {
      throw new Error('Invalid roast result structure');
    }

    // If roastable, ensure we have a roast and valid roast level
    if (roastResult.isRoastable) {
      if (!roastResult.roast || !roastResult.roastLevel) {
        throw new Error('Roastable resume missing roast content');
      }

      const validLevels = ['mild', 'medium', 'spicy', 'inferno'];
      if (!validLevels.includes(roastResult.roastLevel)) {
        roastResult.roastLevel = 'medium'; // Default fallback
      }
    }

    return NextResponse.json(roastResult);

  } catch (error) {
    console.error('Roast error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
