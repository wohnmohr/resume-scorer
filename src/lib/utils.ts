import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Format file size from bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
	if (str.length <= length) return str;
	return `${str.slice(0, length)}...`;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
	if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
	if (score >= 80) return "text-green-600 dark:text-green-400";
	if (score >= 70) return "text-blue-600 dark:text-blue-400";
	if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
	if (score >= 50) return "text-orange-600 dark:text-orange-400";
	return "text-red-600 dark:text-red-400";
}

/**
 * Get score label based on value
 */
export function getScoreLabel(score: number): string {
	if (score >= 90) return "Outstanding";
	if (score >= 80) return "Excellent";
	if (score >= 70) return "Very Good";
	if (score >= 60) return "Good";
	if (score >= 50) return "Fair";
	return "Needs Improvement";
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
