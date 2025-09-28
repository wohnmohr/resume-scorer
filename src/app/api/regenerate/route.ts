import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RegenerateRequest {
  text: string;
}

interface RegeneratedResume {
  text: string;
}

// Simple in-memory storage for demo purposes
// In production, use a proper database
const userUsage = new Map<string, { count: number; isPremium: boolean }>();

export async function POST(request: NextRequest) {
  try {
    const { text }: RegenerateRequest = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    // Get client IP for usage tracking (in production, use proper user identification)
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check if user has premium access
    const userData = userUsage.get(clientIP) || { count: 0, isPremium: false };

    if (!userData.isPremium) {
      return NextResponse.json({
        error: 'Premium subscription required for resume regeneration. Please upgrade to continue.',
        requiresUpgrade: true
      }, { status: 402 });
    }

    const systemPrompt = `You are a professional resume writer with 15+ years of experience helping job seekers land their dream jobs. Your task is to rewrite the provided resume to make it more impactful, ATS-friendly, and compelling to recruiters.

Guidelines for rewriting:
1. Keep ALL factual information intact (names, dates, companies, job titles, education, etc.)
2. Improve action verbs and make achievements more quantifiable
3. Optimize for ATS (Applicant Tracking Systems) with relevant keywords
4. Enhance the professional tone and impact
5. Improve formatting and structure for better readability
6. Make bullet points more results-oriented with specific metrics where possible
7. Ensure consistent formatting and professional language throughout

Return the improved resume as plain text, maintaining the original structure but with enhanced content. Do not add any commentary or explanations - just the improved resume text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please rewrite this resume to be more impactful and job-ready:\n\n${text}` }
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const regeneratedResume: RegeneratedResume = {
      text: responseText.trim()
    };

    return NextResponse.json(regeneratedResume);

  } catch (error) {
    console.error('Regeneration error:', error);

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
