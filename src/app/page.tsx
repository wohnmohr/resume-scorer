"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Script from "next/script";
import Image from "next/image";
import FileUploader from "@/components/FileUploader";
import PDFPreview from "@/components/PDFPreview";
import AnalysisResults from "@/components/AnalysisResults";

interface AnalysisResult {
	score: number;
	suggestions: string[];
}

interface RoastResult {
	isRoastable: boolean;
	roast?: string;
	roastLevel: "mild" | "medium" | "spicy" | "inferno";
	reasons: string[];
}

export default function Home() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [extractedText, setExtractedText] = useState<string>("");
	const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
	const [roast, setRoast] = useState<RoastResult | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isRoasting, setIsRoasting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPdfProcessing, setIsPdfProcessing] = useState(false);
	const [showPdfModal, setShowPdfModal] = useState(false);

	// Use refs to track abort controllers and mounted state
	const abortControllerRef = useRef<AbortController | null>(null);
	const isMountedRef = useRef(true);

	// Cleanup on unmount and handle unhandled promise rejections
	useEffect(() => {
		isMountedRef.current = true;

		// Handle unhandled promise rejections
		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			// Ignore abort errors and extension-related errors
			if (
				event.reason?.name === "AbortError" ||
				event.reason?.message?.includes("message channel closed")
			) {
				event.preventDefault();
				return;
			}
		};

		window.addEventListener("unhandledrejection", handleUnhandledRejection);

		return () => {
			isMountedRef.current = false;
			// Abort any in-flight requests
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			window.removeEventListener(
				"unhandledrejection",
				handleUnhandledRejection
			);
		};
	}, []);

	const handleFileSelect = useCallback(async (file: File) => {
		// Abort any previous request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// Create new abort controller for this request
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		setSelectedFile(file);
		setAnalysis(null);
		setRoast(null);
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
				signal: abortController.signal,
			});

			// Check if component is still mounted
			if (!isMountedRef.current) return;

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to extract text from PDF");
			}

			const result = await response.json();
			const extractedText = result.text;
			console.log(extractedText);

			// Check if component is still mounted before updating state
			if (isMountedRef.current) {
				setExtractedText(extractedText);
				setIsPdfProcessing(false);
			}
		} catch (err) {
			// Ignore abort errors
			if (err instanceof Error && err.name === "AbortError") {
				return;
			}

			// Only update state if component is still mounted
			if (!isMountedRef.current) return;

			console.error("Error extracting text from PDF:", err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to extract text from PDF. Please try a different file."
			);
			setIsPdfProcessing(false);
		} finally {
			// Clear abort controller reference if this was the active request
			if (abortControllerRef.current === abortController) {
				abortControllerRef.current = null;
			}
		}
	}, []);

	const analyzeResume = async () => {
		if (!extractedText) {
			setError("Please wait for the PDF to finish loading.");
			return;
		}

		// Abort any previous request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// Create new abort controller for this request
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		setIsAnalyzing(true);
		setError(null);

		try {
			const response = await fetch("/api/analyze", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text: extractedText }),
				signal: abortController.signal,
			});

			// Check if component is still mounted
			if (!isMountedRef.current) return;

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Analysis failed");
			}

			const result = await response.json();

			// Check if component is still mounted before updating state
			if (isMountedRef.current) {
				setAnalysis(result);
			}
		} catch (err) {
			// Ignore abort errors
			if (err instanceof Error && err.name === "AbortError") {
				return;
			}

			// Only update state if component is still mounted
			if (isMountedRef.current) {
				setError(err instanceof Error ? err.message : "Analysis failed");
			}
		} finally {
			// Only update state if component is still mounted
			if (isMountedRef.current) {
				setIsAnalyzing(false);
			}
			// Clear abort controller reference if this was the active request
			if (abortControllerRef.current === abortController) {
				abortControllerRef.current = null;
			}
		}
	};

	const roastResume = async () => {
		if (!extractedText) {
			setError("Please wait for the PDF to finish loading.");
			return;
		}

		// Abort any previous request
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// Create new abort controller for this request
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		setIsRoasting(true);
		setError(null);

		try {
			const response = await fetch("/api/roast", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text: extractedText }),
				signal: abortController.signal,
			});

			// Check if component is still mounted
			if (!isMountedRef.current) return;

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Roast failed");
			}

			const result = await response.json();

			// Check if component is still mounted before updating state
			if (isMountedRef.current) {
				setRoast(result);
			}
		} catch (err) {
			// Ignore abort errors
			if (err instanceof Error && err.name === "AbortError") {
				return;
			}

			// Only update state if component is still mounted
			if (isMountedRef.current) {
				setError(err instanceof Error ? err.message : "Roast failed");
			}
		} finally {
			// Only update state if component is still mounted
			if (isMountedRef.current) {
				setIsRoasting(false);
			}
			// Clear abort controller reference if this was the active request
			if (abortControllerRef.current === abortController) {
				abortControllerRef.current = null;
			}
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900">
			{/* Header */}
			<header className="bg-slate-900/50 backdrop-blur-md shadow-lg border-b border-indigo-800/30">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-3">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
								<Image
									src="/favicon.svg"
									alt="Resume Scorer"
									width={32}
									height={32}
									className="w-6 h-6"
								/>
							</div>
							<h1 className="text-xl font-bold bg-gradient-to-r from-indigo-300 via-cyan-300 to-indigo-200 bg-clip-text text-transparent">
								Resume Scorer
							</h1>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center mb-8">
					<div className="mb-6">
						<span className="inline-block px-5 py-2.5 bg-gradient-to-r from-indigo-500/90 to-cyan-500/90 text-white text-sm font-semibold rounded-full mb-4 shadow-lg shadow-indigo-500/30 backdrop-blur-sm">
							📊 AI Resume Scorer
						</span>
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
						Get Your Resume Score
						<br />
						<span className="text-3xl md:text-4xl bg-gradient-to-r from-indigo-300 via-cyan-300 to-indigo-200 bg-clip-text text-transparent">
							Instantly
						</span>
					</h1>
					<p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-6 font-medium">
						Upload your resume and get a quick score with instant feedback to
						improve your chances of landing interviews.
					</p>
					<div className="flex flex-wrap justify-center gap-4 text-sm">
						<span className="flex items-center px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-400/30 shadow-sm backdrop-blur-sm font-medium">
							✅ 100% Free
						</span>
						<span className="flex items-center px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30 shadow-sm backdrop-blur-sm font-medium">
							⚡ Instant Analysis
						</span>
						<span className="flex items-center px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/30 shadow-sm backdrop-blur-sm font-medium">
							🚀 Quick Feedback
						</span>
					</div>
				</div>

				{/* Upload Section */}
				<div className="bg-slate-800/40 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-800/30 p-6 mb-8">
					<div className="text-center mb-6">
						<h2 className="text-2xl font-semibold text-white mb-2">
							Upload Your Resume
						</h2>
						<p className="text-slate-300">
							Get your resume scored with quick feedback in seconds
						</p>
					</div>

					{!selectedFile ? (
						<FileUploader onFileSelect={handleFileSelect} />
					) : (
						<div className="space-y-4">
							<div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 rounded-xl shadow-sm backdrop-blur-sm">
								<div className="flex items-center space-x-3">
									<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-md shadow-emerald-500/30">
										<svg
											className="w-5 h-5 text-white"
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
										<p className="font-semibold text-white">
											{selectedFile.name}
										</p>
										<p className="text-sm text-slate-300">
											{(selectedFile.size / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									{extractedText && (
										<button
											onClick={() => setShowPdfModal(true)}
											className="px-4 py-2 text-sm bg-indigo-500/30 text-indigo-200 rounded-lg hover:bg-indigo-500/40 transition-all font-medium shadow-sm backdrop-blur-sm border border-indigo-400/30"
										>
											Preview PDF
										</button>
									)}
									<button
										onClick={() => {
											setSelectedFile(null);
											setAnalysis(null);
											setRoast(null);
											setError(null);
											setIsPdfProcessing(false);
											setExtractedText("");
										}}
										className="text-slate-400 hover:text-slate-200 transition-colors"
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
								<div className="flex items-center justify-center p-6 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-indigo-800/30">
									<div className="text-center">
										<div className="animate-spin rounded-full h-10 w-10 border-3 border-indigo-400 border-t-transparent mx-auto"></div>
										<p className="mt-3 text-sm text-slate-300 font-medium">
											Processing PDF...
										</p>
									</div>
								</div>
							)}

							{extractedText && !isPdfProcessing && !analysis && !roast && (
								<div className="bg-slate-800/40 backdrop-blur-md border border-indigo-800/30 rounded-2xl p-6 shadow-2xl">
									<div className="text-center mb-6">
										<div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
											<svg
												className="w-8 h-8 text-white"
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
										<h3 className="text-xl font-bold text-white mb-2">
											PDF Processed Successfully!
										</h3>
										<p className="text-slate-300 mb-4">
											{extractedText.length} characters extracted. Choose how
											you&apos;d like to proceed:
										</p>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{/* Analyze Option */}
										<div className="bg-slate-700/40 backdrop-blur-sm rounded-xl border-2 border-indigo-500/30 p-6 hover:border-indigo-400 hover:shadow-lg transition-all">
											<div className="text-center">
												<div className="text-4xl mb-3">📊</div>
												<h4 className="text-lg font-semibold text-white mb-2">
													Get Professional Analysis
												</h4>
												<p className="text-sm text-slate-300 mb-4">
													Get a detailed score and constructive feedback to
													improve your resume
												</p>
												<button
													onClick={analyzeResume}
													disabled={isAnalyzing}
													className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-indigo-500/30"
												>
													{isAnalyzing ? "Analyzing..." : "📊 Analyze Resume"}
												</button>
											</div>
										</div>

										{/* Roast Option */}
										<div className="bg-slate-700/40 backdrop-blur-sm rounded-xl border-2 border-rose-500/30 p-6 hover:border-rose-400 hover:shadow-lg transition-all">
											<div className="text-center">
												<div className="text-4xl mb-3">🔥</div>
												<h4 className="text-lg font-semibold text-white mb-2">
													Get a Humorous Roast
												</h4>
												<p className="text-sm text-slate-300 mb-4">
													Get brutally honest (but funny) feedback if your
													resume has issues
												</p>
												<button
													onClick={roastResume}
													disabled={isRoasting}
													className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-lg hover:from-rose-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-rose-500/30"
												>
													{isRoasting ? "Roasting..." : "🔥 Roast Me"}
												</button>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Error Display */}
				{error && (
					<div className="bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-400/30 rounded-xl p-4 mb-6 shadow-sm backdrop-blur-sm">
						<div className="flex items-center space-x-3">
							<div className="w-8 h-8 bg-rose-500/30 rounded-full flex items-center justify-center flex-shrink-0">
								<svg
									className="w-5 h-5 text-rose-300"
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
							</div>
							<p className="text-rose-200 font-medium">{error}</p>
						</div>
					</div>
				)}

				{/* Analysis Results - Prominently Displayed */}
				{analysis && (
					<div>
						<AnalysisResults analysis={analysis} isAnalyzing={isAnalyzing} />
						{/* Try Different Analysis Button */}
						<div className="mt-6 text-center">
							<button
								onClick={() => {
									setAnalysis(null);
									setRoast(null);
								}}
								className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold shadow-lg"
							>
								🔄 Try Different Analysis
							</button>
						</div>
					</div>
				)}

				{/* Roast Results */}
				{roast && (
					<div>
						<div className="bg-gradient-to-r from-rose-50 via-orange-50 to-amber-50 rounded-2xl shadow-xl p-6 border-2 border-rose-200/50 mb-6">
							<div className="text-center mb-6">
								<div className="text-6xl mb-4">🔥</div>
								<h2 className="text-3xl font-bold text-slate-900 mb-2">
									{roast.isRoastable
										? "Resume Roast Results"
										: "Your Resume is Actually Pretty Good!"}
								</h2>
								{roast.isRoastable && (
									<div className="flex items-center justify-center space-x-2 mb-4">
										<span
											className={`px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${
												roast.roastLevel === "mild"
													? "bg-amber-100 text-amber-800 border border-amber-200"
													: roast.roastLevel === "medium"
													? "bg-orange-100 text-orange-800 border border-orange-200"
													: roast.roastLevel === "spicy"
													? "bg-rose-100 text-rose-800 border border-rose-200"
													: "bg-red-200 text-red-900 border border-red-300"
											}`}
										>
											{roast.roastLevel === "mild"
												? "🌶️ Mild Roast"
												: roast.roastLevel === "medium"
												? "🌶️🌶️ Medium Roast"
												: roast.roastLevel === "spicy"
												? "🌶️🌶️🌶️ Spicy Roast"
												: "🌶️🌶️🌶️🌶️ INFERNO ROAST"}
										</span>
									</div>
								)}
							</div>

							{roast.isRoastable ? (
								<div className="space-y-6">
									{/* The Roast */}
									<div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-rose-200/50 shadow-sm">
										<h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
											<span className="mr-2">🎭</span>
											The Roast
										</h3>
										<div className="bg-gradient-to-r from-slate-50 to-rose-50/30 rounded-xl p-5 border-l-4 border-rose-500 shadow-sm">
											<p className="text-slate-800 text-lg leading-relaxed font-medium">
												{roast.roast}
											</p>
										</div>
									</div>

									{/* Reasons */}
									<div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-rose-200/50 shadow-sm">
										<h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
											<span className="mr-2">📋</span>
											What Got You Roasted
										</h3>
										<ul className="space-y-3">
											{roast.reasons.map((reason, index) => (
												<li key={index} className="flex items-start space-x-3">
													<div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
														<span className="text-white text-sm font-semibold">
															{index + 1}
														</span>
													</div>
													<p className="text-slate-700 leading-relaxed">
														{reason}
													</p>
												</li>
											))}
										</ul>
									</div>

									{/* Constructive Advice */}
									<div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-6 border border-indigo-200/50 shadow-sm">
										<h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center">
											<span className="mr-2">💡</span>
											But Here&apos;s How to Fix It
										</h3>
										<p className="text-indigo-800 leading-relaxed">
											Don&apos;t worry! Getting roasted means there&apos;s room
											for improvement. Use the regular analysis above to get
											specific, actionable feedback on how to make your resume
											shine. Every great resume started somewhere!
										</p>
									</div>
								</div>
							) : (
								<div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-6 border border-emerald-200/50 shadow-sm">
									<div className="text-center">
										<div className="text-4xl mb-4">🎉</div>
										<h3 className="text-xl font-bold text-emerald-900 mb-2">
											Congratulations!
										</h3>
										<p className="text-emerald-800 leading-relaxed">
											Your resume doesn&apos;t have any major issues that
											warrant a roast! This is actually a good sign - it means
											your resume is well-structured and professional. Keep up
											the good work!
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Try Different Analysis Button */}
						<div className="mt-6 text-center">
							<button
								onClick={() => {
									setAnalysis(null);
									setRoast(null);
								}}
								className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold shadow-lg"
							>
								🔄 Try Different Analysis
							</button>
						</div>
					</div>
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
			<footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white py-12 mt-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
						{/* Brand Section */}
						<div className="text-center md:text-left">
							<div className="flex items-center justify-center md:justify-start mb-4">
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg">
									<Image
										src="/favicon.svg"
										alt="Resume Scorer"
										width={32}
										height={32}
										className="w-6 h-6"
									/>
								</div>
								<h3 className="text-xl font-bold ml-3 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
									AI Resume Scorer
								</h3>
							</div>
							<p className="text-slate-300 text-sm leading-relaxed">
								Score your resume with quick feedback in seconds
							</p>
						</div>

						{/* Features Section */}
						<div className="text-center md:text-left">
							<h4 className="text-lg font-semibold mb-4 text-cyan-200">
								Features
							</h4>
							<ul className="space-y-2 text-sm text-slate-300">
								<li>🎯 Instant AI Analysis</li>
								<li>📊 Quick Scoring</li>
								<li>💡 Fast Feedback</li>
								<li>🏆 Achievement System</li>
								<li>📱 Mobile Friendly</li>
							</ul>
						</div>

						{/* How It Works Section */}
						<div className="text-center md:text-left">
							<h4 className="text-lg font-semibold mb-4 text-cyan-200">
								How It Works
							</h4>
							<div className="space-y-3 text-sm">
								<div className="flex items-center justify-center md:justify-start">
									<span className="text-cyan-400 mr-2 font-bold">1.</span>
									<span className="text-slate-300">Upload your resume</span>
								</div>
								<div className="flex items-center justify-center md:justify-start">
									<span className="text-cyan-400 mr-2 font-bold">2.</span>
									<span className="text-slate-300">AI analyzes content</span>
								</div>
								<div className="flex items-center justify-center md:justify-start">
									<span className="text-cyan-400 mr-2 font-bold">3.</span>
									<span className="text-slate-300">
										Get your score & quick feedback
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Bottom Section */}
					<div className="border-t border-slate-700/50 pt-8">
						<div className="flex flex-col md:flex-row justify-between items-center">
							<div className="text-sm text-slate-400 mb-4 md:mb-0">
								© 2024 AI Resume Scorer.
							</div>
							<div className="flex items-center space-x-6 text-sm text-slate-400">
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
