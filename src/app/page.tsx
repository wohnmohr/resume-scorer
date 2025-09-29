"use client";

import { useState, useCallback } from "react";
import Script from "next/script";
import FileUploader from "@/components/FileUploader";
import PDFPreview from "@/components/PDFPreview";
import AnalysisResults from "@/components/AnalysisResults";

interface AnalysisResult {
	score: number;
	suggestions: string[];
}

export default function Home() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [extractedText, setExtractedText] = useState<string>("");
	const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPdfProcessing, setIsPdfProcessing] = useState(false);
	const [showPdfModal, setShowPdfModal] = useState(false);

	const handleFileSelect = useCallback(async (file: File) => {
		setSelectedFile(file);
		setAnalysis(null);
		setError(null);
		setIsPdfProcessing(true);
		setExtractedText("");

		// Extract text immediately when file is selected
		try {
			const formData = new FormData();
			formData.append("file", file);

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

			setExtractedText(extractedText);
			setIsPdfProcessing(false);
		} catch (err) {
			console.error("Error extracting text from PDF:", err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to extract text from PDF. Please try a different file."
			);
			setIsPdfProcessing(false);
		}
	}, []);

	const analyzeResume = async () => {
		if (!extractedText) {
			setError("Please wait for the PDF to finish loading.");
			return;
		}

		setIsAnalyzing(true);
		setError(null);

		try {
			const response = await fetch("/api/analyze", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text: extractedText }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Analysis failed");
			}

			const result = await response.json();
			setAnalysis(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Analysis failed");
		} finally {
			setIsAnalyzing(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Header */}
			<header className="bg-white shadow-sm">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">AI</span>
							</div>
							<h1 className="text-xl font-bold text-gray-900">Resume Scorer</h1>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center mb-8">
					<div className="mb-6">
						<span className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full mb-4">
							📊 AI Resume Scorer
						</span>
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
						Get Your Resume Score
						<br />
						<span className="text-3xl md:text-4xl text-blue-600">
							Instantly
						</span>
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
						Upload your resume and get a quick score with instant feedback to
						improve your chances of landing interviews.
					</p>
					<div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
						<span className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full">
							✅ 100% Free
						</span>
						<span className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
							⚡ Instant Analysis
						</span>
						<span className="flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
							🚀 Quick Feedback
						</span>
					</div>
				</div>

				{/* Upload Section */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-8">
					<div className="text-center mb-6">
						<h2 className="text-2xl font-semibold text-gray-900 mb-2">
							Upload Your Resume
						</h2>
						<p className="text-gray-600">
							Get your resume scored with quick feedback in seconds
						</p>
					</div>

					{!selectedFile ? (
						<FileUploader onFileSelect={handleFileSelect} />
					) : (
						<div className="space-y-4">
							<div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
										<svg
											className="w-5 h-5 text-green-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
									</div>
									<div>
										<p className="font-medium text-green-900">
											{selectedFile.name}
										</p>
										<p className="text-sm text-green-700">
											{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									{extractedText && (
										<button
											onClick={() => setShowPdfModal(true)}
											className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
										>
											Preview PDF
										</button>
									)}
									<button
										onClick={() => {
											setSelectedFile(null);
											setAnalysis(null);
											setError(null);
											setIsPdfProcessing(false);
											setExtractedText("");
										}}
										className="text-gray-400 hover:text-gray-600"
									>
										<svg
											className="w-5 h-5"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							</div>

							{/* PDF Processing Status */}
							{isPdfProcessing && (
								<div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
									<div className="text-center">
										<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
										<p className="mt-2 text-sm text-gray-600">
											Processing PDF...
										</p>
									</div>
								</div>
							)}

							{extractedText && !isPdfProcessing && (
								<div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
									<div className="flex items-center space-x-3">
										<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
											<svg
												className="w-5 h-5 text-blue-600"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
										</div>
										<div>
											<p className="font-medium text-blue-900">
												PDF processed successfully
											</p>
											<p className="text-sm text-blue-700">
												{extractedText.length} characters extracted
											</p>
										</div>
									</div>
									<button
										onClick={analyzeResume}
										disabled={isAnalyzing}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
									>
										{isAnalyzing ? "Analyzing..." : "Analyze Resume"}
									</button>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Error Display */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
						<div className="flex items-center space-x-2">
							<svg
								className="w-5 h-5 text-red-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<p className="text-red-700">{error}</p>
						</div>
					</div>
				)}

				{/* Analysis Results - Prominently Displayed */}
				{analysis && (
					<AnalysisResults analysis={analysis} isAnalyzing={isAnalyzing} />
				)}

				{/* PDF Preview Modal */}
				{selectedFile && (
					<PDFPreview
						file={selectedFile}
						isOpen={showPdfModal}
						onClose={() => setShowPdfModal(false)}
					/>
				)}
			</main>

			{/* Feedback/Contact Form */}
			<div
				data-fillout-id="gZYGNjwockus"
				data-fillout-embed-type="popup"
				data-fillout-button-text="🚀 Help Us Get Smarter"
				data-fillout-dynamic-resize
				data-fillout-button-float="bottom-right"
				data-fillout-inherit-parameters
				data-fillout-popup-size="medium"
			></div>
			<Script
				src="https://server.fillout.com/embed/v1/"
				strategy="afterInteractive"
			/>

			{/* Footer */}
			<footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mt-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
						{/* Brand Section */}
						<div className="text-center md:text-left">
							<div className="flex items-center justify-center md:justify-start mb-4">
								<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
									<span className="text-white font-bold text-sm">AI</span>
								</div>
								<h3 className="text-xl font-bold ml-2">AI Resume Scorer</h3>
							</div>
							<p className="text-gray-400 text-sm leading-relaxed">
								Score your resume with quick feedback in seconds
							</p>
						</div>

						{/* Features Section */}
						<div className="text-center md:text-left">
							<h4 className="text-lg font-semibold mb-4">Features</h4>
							<ul className="space-y-2 text-sm text-gray-400">
								<li>🎯 Instant AI Analysis</li>
								<li>📊 Quick Scoring</li>
								<li>💡 Fast Feedback</li>
								<li>🏆 Achievement System</li>
								<li>📱 Mobile Friendly</li>
							</ul>
						</div>

						{/* How It Works Section */}
						<div className="text-center md:text-left">
							<h4 className="text-lg font-semibold mb-4">How It Works</h4>
							<div className="space-y-3 text-sm">
								<div className="flex items-center justify-center md:justify-start">
									<span className="text-blue-400 mr-2">1.</span>
									<span className="text-gray-400">Upload your resume</span>
								</div>
								<div className="flex items-center justify-center md:justify-start">
									<span className="text-blue-400 mr-2">2.</span>
									<span className="text-gray-400">AI analyzes content</span>
								</div>
								<div className="flex items-center justify-center md:justify-start">
									<span className="text-blue-400 mr-2">3.</span>
									<span className="text-gray-400">
										Get your score & quick feedback
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Bottom Section */}
					<div className="border-t border-gray-700 pt-8">
						<div className="flex flex-col md:flex-row justify-between items-center">
							<div className="text-sm text-gray-400 mb-4 md:mb-0">
								© 2024 AI Resume Scorer.
							</div>
							<div className="flex items-center space-x-6 text-sm text-gray-400">
								<span>🔒 Secure & Private</span>
								<span>⚡ Lightning Fast</span>
								<span>📊 AI-Powered</span>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
