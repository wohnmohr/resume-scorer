import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
	AlertCircle,
	CheckCircle2,
	Info,
	AlertTriangle,
	X
} from "lucide-react";

const alertVariants = cva(
	"relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+div]:pl-8",
	{
		variants: {
			variant: {
				default: "bg-white border-gray-200 text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100",
				destructive:
					"bg-red-50 border-red-200 text-red-900 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400 [&>svg]:text-red-600 dark:[&>svg]:text-red-400",
				success:
					"bg-green-50 border-green-200 text-green-900 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
				warning:
					"bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/10 dark:border-yellow-900/30 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
				info:
					"bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-400 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

const Alert = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> &
	VariantProps<typeof alertVariants> & {
		onClose?: () => void;
	}
>(({ className, variant, onClose, children, ...props }, ref) => {
	const Icon =
		variant === "destructive" ? AlertCircle :
		variant === "success" ? CheckCircle2 :
		variant === "warning" ? AlertTriangle :
		variant === "info" ? Info :
		Info;

	return (
		<div
			ref={ref}
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		>
			<Icon className="h-4 w-4" />
			<div className="flex-1">{children}</div>
			{onClose && (
				<button
					onClick={onClose}
					className="absolute top-3 right-3 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
					aria-label="Close alert"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h5
		ref={ref}
		className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
		{...props}
	/>
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn("text-sm [&_p]:leading-relaxed", className)}
		{...props}
	/>
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
