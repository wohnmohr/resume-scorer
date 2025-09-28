"use client";

import { useEffect, useState, useCallback } from "react";

interface PDFPreviewProps {
	file: File;
	onTextExtracted?: (text: string) => void;
}

export default function PDFPreview({ file, onTextExtracted }: PDFPreviewProps) {
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [extractedText, setExtractedText] = useState<string>("");

	const extractTextFromPDF = useCallback(
		async (file: File) => {
			try {
				setIsLoading(true);
				setError(null);

				// Create FormData to send file to server
				const formData = new FormData();
				formData.append("file", file);

				// Send file to server-side API for text extraction
				const response = await fetch("/api/extract-pdf", {
					method: "POST",
					body: formData,
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to extract text from PDF");
				}

				const result = await response.json();
				const extractedText = result.text;
				const pageCount = result.pageCount;
				const characterCount = result.characterCount;

				console.log(`PDF has ${pageCount} pages`);
				console.log(`Extracted text length: ${characterCount} characters`);

				setExtractedText(extractedText);

				if (onTextExtracted) {
					onTextExtracted(extractedText);
				}

				setIsLoading(false);
			} catch (err) {
				console.error("Error extracting text from PDF:", err);
				setError(
					err instanceof Error
						? err.message
						: "Failed to extract text from PDF. Please try a different file."
				);
				setIsLoading(false);
			}
		},
		[onTextExtracted]
	);

	useEffect(() => {
		// Create object URL for the PDF file
		const url = URL.createObjectURL(file);
		setPdfUrl(url);

		// Extract text from PDF
		extractTextFromPDF(file);

		// Cleanup function
		return () => {
			URL.revokeObjectURL(url);
		};
	}, [file, extractTextFromPDF]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-2 text-sm text-gray-600">Processing PDF...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
				<div className="text-center">
					<div className="text-red-500 text-4xl mb-2">⚠️</div>
					<p className="text-red-700">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold text-gray-900">PDF Preview</h3>
				<div className="text-sm text-gray-600">
					{extractedText && extractedText.length > 0
						? `Text extracted (${extractedText.length} characters)`
						: "Text extraction completed"}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				{/* PDF Preview */}
				<div className="border rounded-lg overflow-hidden bg-white">
					<div className="p-2 bg-gray-50 border-b">
						<p className="text-sm text-gray-600">PDF Preview</p>
					</div>
					<div className="h-96">
						{pdfUrl && (
							<iframe
								src={pdfUrl}
								className="w-full h-full border-0"
								title="PDF Preview"
							/>
						)}
					</div>
				</div>

				{/* Extracted Text */}
				<div className="border rounded-lg overflow-hidden bg-white">
					<div className="p-2 bg-gray-50 border-b">
						<p className="text-sm text-gray-600">Extracted Text</p>
					</div>
					<div className="h-96 overflow-y-auto p-4">
						<pre className="text-sm text-gray-800 whitespace-pre-wrap">
							{extractedText}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
