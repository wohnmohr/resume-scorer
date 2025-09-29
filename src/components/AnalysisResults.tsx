"use client";

import { useState, useEffect } from "react";

interface AnalysisResult {
	score: number;
	suggestions: string[];
}

interface AnalysisResultsProps {
	analysis: AnalysisResult | null;
	isAnalyzing: boolean;
}

// Achievement system
interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	unlocked: boolean;
	scoreThreshold: number;
}

// Confetti animation component
function ConfettiAnimation({ isActive }: { isActive: boolean }) {
	if (!isActive) return null;

	return (
		<div className="fixed inset-0 pointer-events-none z-50">
			{Array.from({ length: 50 }).map((_, i) => (
				<div
					key={i}
					className="absolute animate-bounce"
					style={{
						left: `${Math.random() * 100}%`,
						animationDelay: `${Math.random() * 2}s`,
						animationDuration: `${2 + Math.random() * 2}s`,
					}}
				>
					<div
						className="w-2 h-2 rounded-full"
						style={{
							backgroundColor: [
								"#FF6B6B",
								"#4ECDC4",
								"#45B7D1",
								"#96CEB4",
								"#FFEAA7",
								"#DDA0DD",
							][Math.floor(Math.random() * 6)],
							transform: `rotate(${Math.random() * 360}deg)`,
						}}
					/>
				</div>
			))}
		</div>
	);
}

// Achievement Badge Component
function AchievementBadge({ achievement }: { achievement: Achievement }) {
	return (
		<div
			className={`p-4 rounded-lg border-2 transition-all duration-300 ${
				achievement.unlocked
					? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-lg"
					: "bg-gray-50 border-gray-200 opacity-60"
			}`}
		>
			<div className="flex items-center space-x-3">
				<div
					className={`text-2xl ${achievement.unlocked ? "animate-bounce" : ""}`}
				>
					{achievement.icon}
				</div>
				<div className="flex-1">
					<h4
						className={`font-semibold ${
							achievement.unlocked ? "text-yellow-800" : "text-gray-500"
						}`}
					>
						{achievement.name}
					</h4>
					<p
						className={`text-sm ${
							achievement.unlocked ? "text-yellow-700" : "text-gray-400"
						}`}
					>
						{achievement.description}
					</p>
				</div>
				{achievement.unlocked && (
					<div className="text-yellow-500">
						<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				)}
			</div>
		</div>
	);
}

// Anticipation Component
function AnticipationLoader({ step }: { step: number }) {
	const messages = [
		"🔍 Analyzing your resume structure...",
		"📊 Evaluating content quality...",
		"🎯 Checking ATS optimization...",
		"✨ Calculating your score...",
	];

	return (
		<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg p-8 border border-blue-200">
			<div className="text-center">
				<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
				<h3 className="text-xl font-bold text-gray-900 mb-2">
					AI Analysis in Progress
				</h3>
				<p className="text-gray-600 mb-4">
					{messages[step] || "Almost done..."}
				</p>
				<div className="w-full bg-gray-200 rounded-full h-2">
					<div
						className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
						style={{ width: `${((step + 1) / messages.length) * 100}%` }}
					/>
				</div>
				<p className="text-sm text-gray-500 mt-2">
					{step + 1} of {messages.length} steps completed
				</p>
			</div>
		</div>
	);
}

// Level System Component
function LevelSystem({ score }: { score: number }) {
	const getLevel = (score: number) => {
		if (score >= 90)
			return { level: 5, name: "Resume Master", color: "purple", icon: "👑" };
		if (score >= 80)
			return { level: 4, name: "Resume Expert", color: "blue", icon: "⭐" };
		if (score >= 70)
			return { level: 3, name: "Resume Pro", color: "green", icon: "🚀" };
		if (score >= 60)
			return { level: 2, name: "Resume Builder", color: "yellow", icon: "📈" };
		return { level: 1, name: "Resume Starter", color: "gray", icon: "🌱" };
	};

	const currentLevel = getLevel(score);
	const nextLevelThreshold =
		currentLevel.level === 5 ? 100 : (currentLevel.level + 1) * 20;
	const progress =
		currentLevel.level === 5
			? 100
			: ((score - (currentLevel.level - 1) * 20) / 20) * 100;

	return (
		<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
			<div className="text-center mb-4">
				<div className="text-4xl mb-2">{currentLevel.icon}</div>
				<h3 className="text-xl font-bold text-gray-900">{currentLevel.name}</h3>
				<p className="text-sm text-gray-600">Level {currentLevel.level}</p>
			</div>

			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span>Progress to next level</span>
					<span>
						{score}/{nextLevelThreshold}
					</span>
				</div>
				<div className="w-full bg-gray-200 rounded-full h-3">
					<div
						className={`h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
							currentLevel.color === "purple"
								? "from-purple-400 to-purple-600"
								: currentLevel.color === "blue"
								? "from-blue-400 to-blue-600"
								: currentLevel.color === "green"
								? "from-green-400 to-green-600"
								: currentLevel.color === "yellow"
								? "from-yellow-400 to-yellow-600"
								: "from-gray-400 to-gray-600"
						}`}
						style={{ width: `${Math.min(progress, 100)}%` }}
					/>
				</div>
			</div>
		</div>
	);
}

// Animated Score Display Component
function AnimatedScore({ score }: { score: number }) {
	const [animatedScore, setAnimatedScore] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		setIsAnimating(true);
		const duration = 2000; // 2 seconds
		const steps = 60;
		const increment = score / steps;
		let current = 0;

		const timer = setInterval(() => {
			current += increment;
			if (current >= score) {
				setAnimatedScore(score);
				setIsAnimating(false);
				clearInterval(timer);
			} else {
				setAnimatedScore(Math.floor(current));
			}
		}, duration / steps);

		return () => clearInterval(timer);
	}, [score]);

	const getScoreColor = (score: number) => {
		if (score >= 80) return "text-green-600";
		if (score >= 60) return "text-yellow-600";
		return "text-red-600";
	};

	const getScoreLabel = (score: number) => {
		if (score >= 80) return "Excellent";
		if (score >= 60) return "Good";
		if (score >= 40) return "Fair";
		return "Needs Improvement";
	};

	return (
		<div className="flex flex-col items-center">
			<div className="text-center">
				<div
					className={`text-8xl font-bold ${getScoreColor(
						score
					)} mb-4 animate-pulse`}
				>
					{isAnimating ? animatedScore : score}
				</div>
				<div className="text-2xl text-gray-600 font-medium">
					{getScoreLabel(score)}
				</div>
				<div className="text-lg text-gray-500 mt-2">out of 100</div>
			</div>
		</div>
	);
}

// Social Sharing Component
function SocialSharing({ score, siteUrl }: { score: number; siteUrl: string }) {
	const [isSharing, setIsSharing] = useState(false);

	const shareText = `I just got a ${score}/100 resume score! Check out this amazing resume critique tool: ${siteUrl}`;
	const shareUrl = encodeURIComponent(siteUrl);
	const encodedText = encodeURIComponent(shareText);

	const shareLinks = {
		twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${shareUrl}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
		whatsapp: `https://wa.me/?text=${encodedText}`,
	};

	const handleShare = async (platform: string) => {
		setIsSharing(true);

		if (
			typeof navigator !== "undefined" &&
			"share" in navigator &&
			typeof navigator.share === "function" &&
			platform === "native"
		) {
			try {
				await navigator.share({
					title: "Resume Score",
					text: shareText,
					url: siteUrl,
				});
			} catch (err) {
				console.log("Error sharing:", err);
			}
		} else {
			window.open(
				shareLinks[platform as keyof typeof shareLinks],
				"_blank",
				"width=600,height=400"
			);
		}

		setTimeout(() => setIsSharing(false), 1000);
	};

	return (
		<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
			<h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
				🎉 Share Your Score!
			</h3>
			<p className="text-sm text-gray-600 mb-4 text-center">
				Proud of your resume score? Share it with your network!
			</p>

			<div className="flex flex-wrap justify-center gap-2 sm:gap-3">
				<button
					onClick={() => handleShare("twitter")}
					disabled={isSharing}
					className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
				>
					<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
					</svg>
					<span>Twitter</span>
				</button>

				<button
					onClick={() => handleShare("linkedin")}
					disabled={isSharing}
					className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 text-sm sm:text-base"
				>
					<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
					</svg>
					<span>LinkedIn</span>
				</button>

				<button
					onClick={() => handleShare("facebook")}
					disabled={isSharing}
					className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
				>
					<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
					</svg>
					<span>Facebook</span>
				</button>

				<button
					onClick={() => handleShare("whatsapp")}
					disabled={isSharing}
					className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 text-sm sm:text-base"
				>
					<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
					</svg>
					<span>WhatsApp</span>
				</button>

				{typeof navigator !== "undefined" &&
					"share" in navigator &&
					typeof navigator.share === "function" && (
						<button
							onClick={() => handleShare("native")}
							disabled={isSharing}
							className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
								/>
							</svg>
							<span>Share</span>
						</button>
					)}
			</div>
		</div>
	);
}

export default function AnalysisResults({
	analysis,
	isAnalyzing,
}: AnalysisResultsProps) {
	const [showConfetti, setShowConfetti] = useState(false);
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [showAchievements, setShowAchievements] = useState(false);
	const [showScoreReveal, setShowScoreReveal] = useState(false);
	const [showInsights, setShowInsights] = useState(false);
	const [anticipationStep, setAnticipationStep] = useState(0);

	// ANTICIPATION → REVEAL → INSIGHT → FOMO Flow
	useEffect(() => {
		if (analysis) {
			// Step 1: ANTICIPATION - Build excitement
			const anticipationMessages = [
				"🔍 Analyzing your resume structure...",
				"📊 Evaluating content quality...",
				"🎯 Checking ATS optimization...",
				"✨ Calculating your score...",
			];

			let step = 0;
			const anticipationInterval = setInterval(() => {
				setAnticipationStep(step);
				step++;
				if (step >= anticipationMessages.length) {
					clearInterval(anticipationInterval);
					// Step 2: REVEAL - Dramatic score reveal
					setTimeout(() => {
						setShowScoreReveal(true);
						playAchievementSound();
					}, 500);
				}
			}, 800);

			// Step 3: INSIGHTS - Show actionable insights after reveal
			setTimeout(() => {
				setShowInsights(true);
			}, 2000);

			const allAchievements: Achievement[] = [
				{
					id: "good_score",
					name: "On the Right Track",
					description: "Achieved a score of 60 or higher",
					icon: "📈",
					unlocked: analysis.score >= 60,
					scoreThreshold: 60,
				},
				{
					id: "great_score",
					name: "Resume Champion",
					description: "Achieved a score of 80 or higher",
					icon: "🏆",
					unlocked: analysis.score >= 80,
					scoreThreshold: 80,
				},
				{
					id: "excellent_score",
					name: "Resume Master",
					description: "Achieved a score of 90 or higher",
					icon: "👑",
					unlocked: analysis.score >= 90,
					scoreThreshold: 90,
				},
				{
					id: "perfect_score",
					name: "Resume Legend",
					description: "Achieved a perfect score of 100",
					icon: "💎",
					unlocked: analysis.score === 100,
					scoreThreshold: 100,
				},
			];

			setAchievements(allAchievements);

			// Show confetti for high scores
			if (analysis.score >= 80) {
				setShowConfetti(true);
				setTimeout(() => setShowConfetti(false), 3000);
			}

			// Show achievements modal for new unlocks
			const newUnlocks = allAchievements.filter(
				(a) => a.unlocked && a.scoreThreshold > 0
			);
			if (newUnlocks.length > 0) {
				setTimeout(() => setShowAchievements(true), 5000);
			}
		}
	}, [analysis]);

	// Play sound effect for achievements
	const playAchievementSound = () => {
		if (typeof window !== "undefined" && "AudioContext" in window) {
			const audioContext = new (window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext })
					.webkitAudioContext)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
			oscillator.frequency.exponentialRampToValueAtTime(
				1200,
				audioContext.currentTime + 0.1
			);

			gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(
				0.01,
				audioContext.currentTime + 0.3
			);

			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + 0.3);
		}
	};

	if (isAnalyzing) {
		return <AnticipationLoader step={anticipationStep} />;
	}

	if (!analysis) {
		return null;
	}

	return (
		<div className="space-y-6">
			{/* Confetti Animation */}
			<ConfettiAnimation isActive={showConfetti} />

			{/* Achievements Modal */}
			{showAchievements && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
						<div className="text-center mb-4">
							<div className="text-4xl mb-2">🎉</div>
							<h3 className="text-xl font-bold text-gray-900">
								Achievement Unlocked!
							</h3>
							<p className="text-gray-600">You&apos;ve earned new badges!</p>
						</div>
						<div className="space-y-3">
							{achievements
								.filter((a) => a.unlocked && a.scoreThreshold > 0)
								.map((achievement) => (
									<AchievementBadge
										key={achievement.id}
										achievement={achievement}
									/>
								))}
						</div>
						<button
							onClick={() => {
								setShowAchievements(false);
								playAchievementSound();
							}}
							className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Awesome!
						</button>
					</div>
				</div>
			)}

			{/* Level System */}
			<LevelSystem score={analysis.score} />

			{/* REVEAL: Dramatic Score Reveal */}
			{showScoreReveal && (
				<div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-8 border-2 border-green-200 animate-pulse">
					<div className="text-center">
						<div className="text-6xl mb-4">🎯</div>
						<h2 className="text-3xl font-bold text-gray-900 mb-2">
							Your Resume Score is...
						</h2>
						<div className="text-6xl font-bold text-green-600 mb-4 animate-bounce">
							{analysis.score}/100
						</div>
						<p className="text-lg text-gray-600">
							{analysis.score >= 80
								? "Excellent work!"
								: analysis.score >= 60
								? "Good job!"
								: "Room for improvement!"}
						</p>
					</div>
				</div>
			)}

			{/* Analysis Results */}
			<div className="bg-white rounded-lg shadow-lg p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
					{analysis.score >= 80 && (
						<div className="text-2xl animate-bounce">🎉</div>
					)}
				</div>

				{/* Animated Score */}
				<div className="flex justify-center mb-8">
					<div className="w-full max-w-xs sm:max-w-sm">
						<AnimatedScore score={analysis.score} />
					</div>
				</div>

				{/* Social Sharing */}
				<div className="mb-6">
					<SocialSharing
						score={analysis.score}
						siteUrl={
							typeof window !== "undefined"
								? window.location.origin
								: "https://resume-critique.com"
						}
					/>
				</div>

				{/* ACTIONABLE INSIGHTS - Show after reveal */}
				{showInsights && (
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-900 flex items-center">
							<span className="mr-2">💡</span>
							Actionable Insights
						</h3>
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
							<p className="text-sm text-blue-800 font-medium">
								🎯 <strong>Pro Tip:</strong> These suggestions are ranked by
								impact. Focus on the first one to see the biggest improvement in
								your next analysis!
							</p>
						</div>
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
				)}
			</div>

			{/* Achievements Section */}
			<div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-lg p-6 border border-yellow-200">
				<h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
					<span className="mr-2">🏆</span>
					Achievements
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{achievements.map((achievement) => (
						<AchievementBadge key={achievement.id} achievement={achievement} />
					))}
				</div>
			</div>
		</div>
	);
}
