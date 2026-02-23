import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "#lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
	{
		variants: {
			variant: {
				default:
					"bg-gradient-to-b from-white/10 to-white/5 text-white border border-white/10 hover:border-white/20 hover:from-white/15 hover:to-white/10 shadow-lg shadow-black/20",
				primary:
					"bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30 hover:from-cyan-400 hover:to-cyan-500 hover:shadow-cyan-400/40",
				destructive:
					"bg-gradient-to-b from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:from-red-400 hover:to-red-500",
				ghost: "text-gray-300 hover:text-white hover:bg-white/5",
				outline:
					"border border-white/10 text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/5",
				link: "text-cyan-400 underline-offset-4 hover:underline",
			},
			size: {
				default: "h-9 px-4 py-2",
				sm: "h-8 px-3 text-xs",
				lg: "h-11 px-6 text-base",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, type = "button", ...props }, ref) => {
		return (
			<button
				type={type}
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
