import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

// Type definitions for PDF data structure
interface PDFMeta {
  Title?: string;
  Author?: string;
  Subject?: string;
  Creator?: string;
}

interface PDFTextRun {
  T: string;
}

interface PDFText {
  R: PDFTextRun[];
}

interface PDFPage {
  Texts: PDFText[];
}

interface PDFData {
  Meta?: PDFMeta;
  Pages?: PDFPage[];
}

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

    // Convert File to Buffer for pdf2json
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from PDF using pdf2json
    const pdfParser = new PDFParser();

    // Create a promise to handle the async nature of pdf2json
    const pdfData = await new Promise<PDFData>((resolve, reject) => {
      pdfParser.on('pdfParser_dataReady', (data: PDFData) => {
        resolve(data);
      });

      pdfParser.on('pdfParser_dataError', (error: Error | { parserError: Error }) => {
        reject(error instanceof Error ? error : error.parserError);
      });

      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    });

    // Extract text from the pdf2json output
    let extractedText = '';
    let pageCount = 0;
    let title = "Resume";
    let author = "";
    let subject = "";
    let creator = "";

    // Extract metadata
    if (pdfData && pdfData.Meta) {
      title = pdfData.Meta.Title || "Resume";
      author = pdfData.Meta.Author || "";
      subject = pdfData.Meta.Subject || "";
      creator = pdfData.Meta.Creator || "";
    }

    // Extract text from all pages
    if (pdfData && pdfData.Pages && Array.isArray(pdfData.Pages)) {
      pageCount = pdfData.Pages.length;

      for (const page of pdfData.Pages) {
        if (page.Texts && Array.isArray(page.Texts)) {
          for (const textItem of page.Texts) {
            if (textItem.R && Array.isArray(textItem.R)) {
              for (const textRun of textItem.R) {
                if (textRun.T) {
                  extractedText += decodeURIComponent(textRun.T);
                }
              }
            }
          }
        }
      }
    }

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
    // First, normalize all whitespace characters and remove zero-width characters
    let cleanedText = extractedText
      .replace(/\u200B/g, "")             // remove zero-width spaces
      .replace(/\u00A0/g, " ")            // replace non-breaking spaces with regular spaces
      .replace(/\u2009|\u200A|\u202F/g, " ") // replace various thin spaces with regular spaces
      .replace(/\r\n/g, "\n")            // normalize line endings
      .replace(/\r/g, "\n")              // normalize line endings
      .replace(/\t/g, " ")                // replace tabs with spaces
      .replace(/[\u2000-\u200F]/g, "")   // remove various Unicode space characters
      .replace(/[\u2028-\u2029]/g, "\n"); // normalize line/paragraph separators

    // Fix spacing around punctuation and special characters
    cleanedText = cleanedText
      .replace(/\s+([.,!?;:])/g, "$1")    // remove space before punctuation
      .replace(/([.,!?;:])\s+/g, "$1 ")    // ensure single space after punctuation
      .replace(/\s+([()])/g, "$1")         // remove space before opening parens
      .replace(/([()])\s+/g, "$1 ")       // ensure space after closing parens (but not before)
      .replace(/([()])\s+/g, "$1")        // remove space after opening parens
      .replace(/\s+([()])/g, " $1");      // ensure space before closing parens

    // Normalize dates and common patterns
    cleanedText = cleanedText
      .replace(/(\d{1,2})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{4})/g, "$1/$2/$3") // normalize dates MM/DD/YYYY
      .replace(/(\d{4})\s*[-/]\s*(\d{1,2})\s*[-/]\s*(\d{1,2})/g, "$1/$2/$3") // normalize dates YYYY/MM/DD
      .replace(/(\w)\s+-\s+(\w)/g, "$1 - $2") // normalize dashes between words
      .replace(/\s+([-–—])\s+/g, " $1 ")     // normalize various dash types with single spaces
      .replace(/\s+/g, " ")                  // collapse multiple spaces to single space
      .replace(/\n\s+/g, "\n")               // remove leading spaces on new lines
      .replace(/\s+\n/g, "\n")               // remove trailing spaces before newlines
      .replace(/\n{3,}/g, "\n\n")            // limit consecutive newlines to max 2
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
