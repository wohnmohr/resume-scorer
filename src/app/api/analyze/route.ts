import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalyzeRequest {
  text: string;
}

interface AnalysisResult {
  score: number;
  suggestions: string[];
  hasUsedFreeTier?: boolean;
}

// Simple in-memory storage for demo purposes
// In production, use a proper database
const userUsage = new Map<string, { count: number; isPremium: boolean }>();

export async function POST(request: NextRequest) {
  try {
    const { text }: AnalyzeRequest = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    // Get client IP for usage tracking (in production, use proper user identification)
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check if user has used free tier
    // const userData = userUsage.get(clientIP) || { count: 0, isPremium: false };
    const userData = { count: 0, isPremium: false };

    if (!userData.isPremium && userData.count >= 1) {
      return NextResponse.json({
        error: 'Free tier limit reached. Please upgrade to continue.',
        hasUsedFreeTier: true
      }, { status: 402 });
    }

    // Increment usage count
    userData.count += 1;
    userUsage.set(clientIP, userData);

    const systemPrompt = `You are a professional recruiter with 10+ years of experience. Analyze the following resume and provide:

1. A score from 0-100 based on:
   - Content quality and relevance
   - Structure and formatting
   - Keywords and ATS optimization
   - Achievements and impact
   - Overall presentation

2. Three specific, actionable suggestions for improvement

Return your response as a JSON object with this exact structure:
{
  "score": [number between 0-100],
  "suggestions": [
    "First specific suggestion",
    "Second specific suggestion", 
    "Third specific suggestion"
  ]
}

Be constructive and specific in your feedback. Focus on actionable improvements that will help the candidate stand out to recruiters and ATS systems.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please analyze this resume:\n\n${text}` }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    let analysisResult: AnalysisResult;
    try {
      console.log('responseText', responseText);
      analysisResult = JSON.parse(responseText);
    } catch {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid response format from AI');
    }

    // Validate the response structure
    if (!analysisResult.score || !analysisResult.suggestions || !Array.isArray(analysisResult.suggestions)) {
      throw new Error('Invalid analysis result structure');
    }

    // Ensure score is within valid range
    analysisResult.score = Math.max(0, Math.min(100, analysisResult.score));

    // Ensure we have exactly 3 suggestions
    if (analysisResult.suggestions.length !== 3) {
      throw new Error('Analysis must provide exactly 3 suggestions');
    }

    return NextResponse.json({
      ...analysisResult,
      hasUsedFreeTier: !userData.isPremium && userData.count > 1
    });

  } catch (error) {
    console.error('Analysis error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
