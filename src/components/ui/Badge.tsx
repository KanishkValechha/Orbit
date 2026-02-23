import { cn } from "../../lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: "default" | "success" | "warning" | "error" | "info";
}

export function Badge({
	className,
	variant = "default",
	children,
	...props
}: BadgeProps) {
	const variants = {
		default: "bg-white/10 text-gray-300 border-white/10",
		success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
		warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
		error: "bg-red-500/20 text-red-400 border-red-500/30",
		info: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
	};

	return (
		<div
			className={cn(
				"inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border",
				variants[variant],
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
