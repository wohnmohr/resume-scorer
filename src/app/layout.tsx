import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "AI Resume Scorer - Get Your Resume Score Instantly",
	description:
		"Score your resume with quick feedback in seconds. Professional AI-powered resume analysis and scoring tool to help you improve your job application.",
	keywords:
		"resume scorer, resume analysis, AI resume, job application, resume feedback, resume score",
	authors: [{ name: "Rangeesh Rajagopal" }],
	icons: {
		icon: [
			{ url: "/favicon.svg?v=1", type: "image/svg+xml" },
			{ url: "/favicon.ico?v=1", sizes: "any" },
		],
		shortcut: "/favicon.ico?v=1",
		apple: "/favicon.svg?v=1",
	},
	openGraph: {
		title: "AI Resume Scorer - Get Your Resume Score Instantly",
		description: "Score your resume with quick feedback in seconds",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.svg?v=1" type="image/svg+xml" />
				<link rel="icon" href="/favicon.ico?v=1" sizes="any" />
				<link rel="shortcut icon" href="/favicon.ico?v=1" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
