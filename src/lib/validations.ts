import { z } from "zod";

/**
 * File validation schema
 */
export const fileSchema = z.object({
	name: z.string().min(1, "File name is required"),
	size: z
		.number()
		.max(10 * 1024 * 1024, "File size must be less than 10MB")
		.positive("File size must be positive"),
	type: z
		.string()
		.refine((type) => type === "application/pdf", {
			message: "Only PDF files are allowed",
		}),
});

/**
 * Resume text validation schema
 */
export const resumeTextSchema = z.object({
	text: z
		.string()
		.min(100, "Resume text must be at least 100 characters")
		.max(50000, "Resume text must not exceed 50,000 characters")
		.trim(),
});

/**
 * Analysis request schema
 */
export const analyzeRequestSchema = z.object({
	text: z
		.string()
		.min(100, "Resume text must be at least 100 characters for analysis")
		.max(50000, "Resume text is too long")
		.trim(),
});

/**
 * Roast request schema
 */
export const roastRequestSchema = z.object({
	text: z
		.string()
		.min(100, "Resume text must be at least 100 characters for roasting")
		.max(50000, "Resume text is too long")
		.trim(),
});

/**
 * Analysis response schema
 */
export const analysisResponseSchema = z.object({
	score: z.number().min(0).max(100),
	suggestions: z.array(z.string()).min(1, "At least one suggestion is required"),
});

/**
 * Roast response schema
 */
export const roastResponseSchema = z.object({
	isRoastable: z.boolean(),
	roast: z.string().optional(),
	roastLevel: z.enum(["mild", "medium", "spicy", "inferno"]),
	reasons: z.array(z.string()),
});

/**
 * Error response schema
 */
export const errorResponseSchema = z.object({
	error: z.string(),
	details: z.string().optional(),
	statusCode: z.number().optional(),
});

/**
 * Constants for validation
 */
export const VALIDATION_CONSTANTS = {
	MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
	MIN_TEXT_LENGTH: 100,
	MAX_TEXT_LENGTH: 50000,
	ALLOWED_FILE_TYPES: ["application/pdf"],
} as const;

/**
 * Helper function to validate file client-side
 */
export function validateFile(file: File): {
	isValid: boolean;
	error?: string;
} {
	try {
		fileSchema.parse({
			name: file.name,
			size: file.size,
			type: file.type,
		});
		return { isValid: true };
	} catch (error) {
		if (error instanceof z.ZodError) {
			return {
				isValid: false,
				error: error.errors[0]?.message || "Invalid file",
			};
		}
		return { isValid: false, error: "File validation failed" };
	}
}

/**
 * Helper function to format Zod errors
 */
export function formatZodError(error: z.ZodError): string {
	return error.errors.map((err) => err.message).join(", ");
}
