"use client";

import { useState, useCallback } from "react";
import FileUploader from "@/components/FileUploader";
import PDFPreview from "@/components/PDFPreview";
import AnalysisResults from "@/components/AnalysisResults";

interface AnalysisResult {
	score: number;
	suggestions: string[];
}

interface RegeneratedResume {
	text: string;
}

export default function Home() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [extractedText, setExtractedText] = useState<string>("");
	const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
	const [regeneratedResume, setRegeneratedResume] =
		useState<RegeneratedResume | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isRegenerating, setIsRegenerating] = useState(false);
	const [hasUsedFreeTier, setHasUsedFreeTier] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFileSelect = useCallback((file: File) => {
		setSelectedFile(file);
		setAnalysis(null);
		setRegeneratedResume(null);
		setError(null);
	}, []);

	const handleTextExtracted = useCallback((text: string) => {
		setExtractedText(text);
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

			// Check if user has used free tier
			if (result.hasUsedFreeTier) {
				setHasUsedFreeTier(true);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Analysis failed");
		} finally {
			setIsAnalyzing(false);
		}
	};

	const regenerateResume = async () => {
		if (!extractedText) {
			setError("No resume text available for regeneration.");
			return;
		}

		setIsRegenerating(true);
		setError(null);

		try {
			const response = await fetch("/api/regenerate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text: extractedText }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Regeneration failed");
			}

			const result = await response.json();
			setRegeneratedResume(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Regeneration failed");
		} finally {
			setIsRegenerating(false);
		}
	};

	const handleUpgrade = async () => {
		try {
			// Create Razorpay order
			const orderResponse = await fetch("/api/create-order", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ amount: 999 }), // $9.99 in cents
			});

			if (!orderResponse.ok) {
				throw new Error("Failed to create payment order");
			}

			const { orderId } = await orderResponse.json();

			// Load Razorpay script
			const script = document.createElement("script");
			script.src = "https://checkout.razorpay.com/v1/checkout.js";
			script.onload = () => {
				const options = {
					key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
					amount: 99900, // $9.99 in paise
					currency: "USD",
					name: "AI Resume Reviewer",
					description: "Unlock unlimited resume analysis and improvements",
					order_id: orderId,
					handler: async (response: {
						razorpay_order_id: string;
						razorpay_payment_id: string;
						razorpay_signature: string;
					}) => {
						// Verify payment on backend
						const verifyResponse = await fetch("/api/verify-payment", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								razorpay_order_id: response.razorpay_order_id,
								razorpay_payment_id: response.razorpay_payment_id,
								razorpay_signature: response.razorpay_signature,
							}),
						});

						if (verifyResponse.ok) {
							setHasUsedFreeTier(false);
							// Now user can regenerate resume
							regenerateResume();
						} else {
							setError("Payment verification failed");
						}
					},
					prefill: {
						email: "user@example.com", // You can get this from user input
					},
					theme: {
						color: "#2563eb",
					},
				};

				const rzp = new window.Razorpay(options);
				rzp.open();
			};
			document.head.appendChild(script);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Payment setup failed");
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
							<h1 className="text-xl font-bold text-gray-900">
								AI Resume Reviewer
							</h1>
						</div>
						<div className="text-sm text-gray-600">
							{hasUsedFreeTier ? "Premium User" : "Free Tier Available"}
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Get Your Resume Analyzed by AI
					</h1>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto">
						Upload your resume and get instant feedback with actionable
						suggestions to improve your chances of landing your dream job.
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{/* Upload Section */}
					<div className="space-y-6">
						<div className="bg-white rounded-lg shadow-lg p-6">
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">
								Upload Your Resume
							</h2>

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
										<button
											onClick={() => {
												setSelectedFile(null);
												setAnalysis(null);
												setRegeneratedResume(null);
												setError(null);
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

									<PDFPreview
										file={selectedFile}
										onTextExtracted={handleTextExtracted}
									/>

									<button
										onClick={analyzeResume}
										disabled={isAnalyzing || !extractedText}
										className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
									>
										{isAnalyzing ? "Analyzing..." : "Analyze Resume"}
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Results Section */}
					<div className="space-y-6">
						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-4">
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

						{analysis && (
							<AnalysisResults
								analysis={analysis}
								regeneratedResume={regeneratedResume}
								onRegenerate={regenerateResume}
								isAnalyzing={isAnalyzing}
								isRegenerating={isRegenerating}
								hasUsedFreeTier={hasUsedFreeTier}
								onUpgrade={handleUpgrade}
							/>
						)}
					</div>
				</div>

				{/* Features Section */}
				<div className="mt-16 bg-white rounded-lg shadow-lg p-8">
					<h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
						Why Choose AI Resume Reviewer?
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-blue-600"
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
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								Instant Analysis
							</h3>
							<p className="text-gray-600">
								Get your resume analyzed in seconds with detailed feedback and
								scoring.
							</p>
						</div>
						<div className="text-center">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-green-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								AI-Powered Improvements
							</h3>
							<p className="text-gray-600">
								Get your resume rewritten by AI to be more impactful and
								job-ready.
							</p>
						</div>
						<div className="text-center">
							<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<svg
									className="w-8 h-8 text-purple-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">
								Affordable Pricing
							</h3>
							<p className="text-gray-600">
								Start with a free analysis, then upgrade for unlimited access to
								improvements.
							</p>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="bg-gray-900 text-white py-8 mt-16">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<p className="text-gray-400">
						© 2024 AI Resume Reviewer. Built with Next.js and powered by OpenAI.
					</p>
				</div>
			</footer>
		</div>
	);
}
