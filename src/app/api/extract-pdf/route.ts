import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert File to Buffer for pdf-parse
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from PDF using pdf-parse
    const pdfData = await pdf(buffer);

    const extractedText = pdfData.text;
    const pageCount = pdfData.numpages;
    const title = pdfData.info?.Title || "Resume";
    const author = pdfData.info?.Author || "";
    const subject = pdfData.info?.Subject || "";
    const creator = pdfData.info?.Creator || "";

    console.log(`PDF has ${pageCount} pages`);
    console.log(`Extracted text length: ${extractedText.length} characters`);

    // If no text was extracted, return an error
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text content found in this PDF. The PDF might be image-based or corrupted.' },
        { status: 400 }
      );
    }

    // Clean up the text (remove excessive whitespace, normalize line breaks)
    const cleanedText = extractedText
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Replace multiple newlines with single newline
      .trim();

    return NextResponse.json({
      text: cleanedText,
      pageCount,
      characterCount: cleanedText.length,
      metadata: {
        title,
        author,
        subject,
        creator
      }
    });

  } catch (error) {
    console.error('PDF extraction error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to extract text from PDF' },
      { status: 500 }
    );
  }
}
