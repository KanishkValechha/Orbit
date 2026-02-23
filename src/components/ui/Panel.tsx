import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const panelVariants = cva(
	"rounded-xl border backdrop-blur-xl transition-all duration-300",
	{
		variants: {
			variant: {
				default: "bg-black/40 border-white/5 shadow-xl shadow-black/20",
				elevated: "bg-white/5 border-white/10 shadow-2xl shadow-black/30",
				glass: "bg-white/[0.03] border-white/[0.08] shadow-lg",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface PanelProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof panelVariants> {}

export function Panel({ className, variant, ...props }: PanelProps) {
	return (
		<div className={cn(panelVariants({ variant }), className)} {...props} />
	);
}

interface PanelHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PanelHeader({
	className,
	children,
	...props
}: PanelHeaderProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-between px-4 py-3 border-b border-white/5",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

interface PanelTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export function PanelTitle({ className, ...props }: PanelTitleProps) {
	return (
		<h3
			className={cn(
				"text-sm font-medium text-gray-200 tracking-wide",
				className,
			)}
			{...props}
		/>
	);
}

interface PanelContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PanelContent({ className, ...props }: PanelContentProps) {
	return <div className={cn("p-4", className)} {...props} />;
}
