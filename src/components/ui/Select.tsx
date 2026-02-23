import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "#lib/utils";

const selectVariants = cva(
	"flex items-center justify-between rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-white/5 border border-white/10 text-gray-200 hover:border-white/20 hover:bg-white/10",
				ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/5",
			},
			size: {
				default: "h-9 px-3 py-2",
				sm: "h-8 px-2 text-xs",
				lg: "h-11 px-4 text-base",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface SelectProps
	extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size">,
		VariantProps<typeof selectVariants> {
	options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ className, variant, size, options, ...props }, ref) => {
		return (
			<div className="relative">
				<select
					className={cn(
						selectVariants({ variant, size }),
						"appearance-none pr-8 w-full cursor-pointer",
						className,
					)}
					ref={ref}
					{...props}
				>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
			</div>
		);
	},
);
Select.displayName = "Select";

export { Select, selectVariants };
