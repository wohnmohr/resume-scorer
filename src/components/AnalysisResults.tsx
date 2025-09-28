"use client";

import { useState } from "react";

interface AnalysisResult {
	score: number;
	suggestions: string[];
}

interface RegeneratedResume {
	text: string;
}

interface AnalysisResultsProps {
	analysis: AnalysisResult | null;
	regeneratedResume: RegeneratedResume | null;
	onRegenerate: () => void;
	isAnalyzing: boolean;
	isRegenerating: boolean;
	hasUsedFreeTier: boolean;
	onUpgrade: () => void;
}

export default function AnalysisResults({
	analysis,
	regeneratedResume,
	onRegenerate,
	isAnalyzing,
	isRegenerating,
	hasUsedFreeTier,
	onUpgrade,
}: AnalysisResultsProps) {
	const [activeTab, setActiveTab] = useState<"analysis" | "regenerated">(
		"analysis"
	);

	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-600 bg-green-100";
		if (score >= 60) return "text-yellow-600 bg-yellow-100";
		return "text-red-600 bg-red-100";
	};

	const getScoreLabel = (score: number) => {
		if (score >= 80) return "Excellent";
		if (score >= 60) return "Good";
		if (score >= 40) return "Fair";
		return "Needs Improvement";
	};

	if (isAnalyzing) {
		return (
			<div className="bg-white rounded-lg shadow-lg p-6">
				<div className="flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
					<span className="ml-3 text-lg text-gray-700">
						Analyzing your resume...
					</span>
				</div>
			</div>
		);
	}

	if (!analysis) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Analysis Results */}
			<div className="bg-white rounded-lg shadow-lg p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
					<div
						className={`px-4 py-2 rounded-full text-sm font-semibold ${getScoreColor(
							analysis.score
						)}`}
					>
						{analysis.score}/100 - {getScoreLabel(analysis.score)}
					</div>
				</div>

				<div className="mb-6">
					<div className="w-full bg-gray-200 rounded-full h-3">
						<div
							className={`h-3 rounded-full transition-all duration-500 ${
								analysis.score >= 80
									? "bg-green-500"
									: analysis.score >= 60
									? "bg-yellow-500"
									: "bg-red-500"
							}`}
							style={{ width: `${analysis.score}%` }}
						></div>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-lg font-semibold text-gray-900">
						Suggestions for Improvement
					</h3>
					<ul className="space-y-3">
						{analysis.suggestions.map((suggestion, index) => (
							<li key={index} className="flex items-start space-x-3">
								<div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
									<span className="text-blue-600 text-sm font-semibold">
										{index + 1}
									</span>
								</div>
								<p className="text-gray-700 leading-relaxed">{suggestion}</p>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Regeneration Section */}
			<div className="bg-white rounded-lg shadow-lg p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-xl font-semibold text-gray-900">
						Improved Resume
					</h3>
					<div className="flex space-x-2">
						<button
							onClick={() => setActiveTab("analysis")}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
								activeTab === "analysis"
									? "bg-blue-100 text-blue-700"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							Original Analysis
						</button>
						<button
							onClick={() => setActiveTab("regenerated")}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
								activeTab === "regenerated"
									? "bg-blue-100 text-blue-700"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							Improved Version
						</button>
					</div>
				</div>

				{activeTab === "analysis" && (
					<div className="space-y-4">
						<div className="p-4 bg-gray-50 rounded-lg">
							<h4 className="font-semibold text-gray-900 mb-2">
								Analysis Summary
							</h4>
							<p className="text-gray-700">
								Your resume scored {analysis.score} out of 100.{" "}
								{getScoreLabel(analysis.score)} -
								{analysis.score >= 80
									? " Your resume is well-structured and impactful!"
									: " Consider implementing the suggestions above to improve your resume."}
							</p>
						</div>
					</div>
				)}

				{activeTab === "regenerated" && (
					<div className="space-y-4">
						{regeneratedResume ? (
							<div className="space-y-4">
								<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
									<h4 className="font-semibold text-green-900 mb-2">
										✨ Improved Resume
									</h4>
									<p className="text-green-700 text-sm mb-3">
										Here&apos;s your resume rewritten to be more impactful and
										job-ready:
									</p>
									<div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
										<pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
											{regeneratedResume.text}
										</pre>
									</div>
								</div>
								<div className="flex space-x-3">
									<button
										onClick={() => {
											navigator.clipboard.writeText(regeneratedResume.text);
											// You could add a toast notification here
										}}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
									>
										Copy to Clipboard
									</button>
									<button
										onClick={() => {
											const blob = new Blob([regeneratedResume.text], {
												type: "text/plain",
											});
											const url = URL.createObjectURL(blob);
											const a = document.createElement("a");
											a.href = url;
											a.download = "improved-resume.txt";
											a.click();
											URL.revokeObjectURL(url);
										}}
										className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
									>
										Download as Text
									</button>
								</div>
							</div>
						) : (
							<div className="text-center py-8">
								{hasUsedFreeTier ? (
									<div className="space-y-4">
										<div className="text-4xl">🔒</div>
										<h4 className="text-lg font-semibold text-gray-900">
											Upgrade Required
										</h4>
										<p className="text-gray-600">
											You&apos;ve used your free analysis. Upgrade to unlock the
											improved resume feature.
										</p>
										<button
											onClick={onUpgrade}
											className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
										>
											Upgrade Now - $9.99
										</button>
									</div>
								) : (
									<div className="space-y-4">
										<div className="text-4xl">✨</div>
										<h4 className="text-lg font-semibold text-gray-900">
											Get Improved Resume
										</h4>
										<p className="text-gray-600">
											Click the button below to generate an improved version of
											your resume.
										</p>
										<button
											onClick={onRegenerate}
											disabled={isRegenerating}
											className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
										>
											{isRegenerating
												? "Generating..."
												: "Generate Improved Resume"}
										</button>
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
