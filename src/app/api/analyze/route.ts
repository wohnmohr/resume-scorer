import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalyzeRequest {
  text: string;
}

interface AnalysisResult {
  score: number;
  suggestions: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { text }: AnalyzeRequest = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }


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

Be constructive and specific in your feedback. Focus on actionable improvements that will help the candidate stand out to recruiters and ATS systems and keep it short and simple.`;

    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-chat-v3.1:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please analyze this resume:\n\n${text}` }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
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

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Analysis error:', error);

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
