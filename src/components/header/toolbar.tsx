import {
	ArrowBigUp,
	Code,
	Command,
	CornerDownLeft,
	Download,
	Loader2,
	Play,
	RotateCcw,
	Share2,
} from "lucide-react";
import { Kbd, KbdGroup } from "#/components/ui/kbd";
import type { ThemeInfo } from "#/lib/themes/theme-data";
import type { ExecutionMode } from "#/lib/sandbox/types";

interface ToolbarProps {
	themeColors: ThemeInfo["colors"];
	isRunning: boolean;
	mode: ExecutionMode;
	onRun: () => void;
	onReset: () => void;
	onDownload: () => void;
	onModeChange: (mode: ExecutionMode) => void;
	onShare?: () => void;
	isSharing?: boolean;
	children?: React.ReactNode;
}

export function Toolbar({
	themeColors,
	isRunning,
	mode,
	onRun,
	onReset,
	onDownload,
	onModeChange,
	onShare,
	isSharing,
	children,
}: ToolbarProps) {
	return (
		<header
			className="relative flex items-center justify-between px-4 h-12 z-10 shrink-0"
			style={{
				borderBottom: `1px solid ${themeColors.border}`,
				background: themeColors.bgSecondary,
			}}
		>
			<div className="flex items-center gap-2">

				<Code className="w-3 h-3" strokeWidth={2} />
				<span
					className="text-sm font-medium tracking-tight"
					style={{ color: themeColors.text }}
				>
					orbit
				</span>
			</div>

			<div className="flex items-center gap-1.5">
				<KbdGroup
					className="hidden sm:inline-flex"
					style={{
						background: `${themeColors.bgTertiary}80`,
						color: themeColors.textMuted,
						border: `1px solid ${themeColors.border}50`,
						padding: "2px 6px",
						borderRadius: "4px",
					}}
				>
					<Kbd style={{ background: "transparent", border: "none", padding: 0 }}>
						<Command className="size-3" />
					</Kbd>
					<Kbd style={{ background: "transparent", border: "none", padding: 0 }}>
						<ArrowBigUp className="size-3" />
					</Kbd>
					<Kbd style={{ background: "transparent", border: "none", padding: 0 }}>
						<CornerDownLeft className="size-3" />
					</Kbd>
				</KbdGroup>

				<button
					type="button"
					onClick={onRun}
					disabled={isRunning}
					className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-medium rounded transition-colors duration-150 disabled:opacity-50 cursor-pointer hover:opacity-80"
					style={{
						background: themeColors.bgTertiary,
						color: themeColors.text,
						border: `1px solid ${themeColors.border}`,
					}}
				>
					{isRunning ? (
						<Loader2 className="w-3 h-3 orbit-spinner" />
					) : (
						<Play className="w-3 h-3" fill="currentColor" strokeWidth={2} />
					)}
					{isRunning ? "Running" : "Run"}
				</button>

				<div
					className="h-5 w-px opacity-40"
					style={{ background: themeColors.border }}
				/>

				<div
					className="flex items-center h-7 rounded overflow-hidden"
					style={{
						border: `1px solid ${themeColors.border}`,
						background: themeColors.bgTertiary,
					}}
				>
					{(["iframe", "worker"] as ExecutionMode[]).map((m) => (
						<button
							key={m}
							type="button"
							onClick={() => onModeChange(m)}
							className="h-full px-2.5 text-[11px] font-medium transition-all duration-150 cursor-pointer capitalize"
							style={{
								color:
									mode === m
										? themeColors.text
										: themeColors.textMuted,
								background:
									mode === m
										? `${themeColors.accent}18`
										: "transparent",
							}}
						>
							{m}
						</button>
					))}
				</div>

				{children}

				<div
					className="h-5 w-px mx-0.5 opacity-40"
					style={{ background: themeColors.border }}
				/>

				<ToolbarButton
					onClick={onReset}
					title="Reset"
					themeColors={themeColors}
				>
					<RotateCcw className="w-3.5 h-3.5" />
				</ToolbarButton>

				<ToolbarButton
					onClick={onDownload}
					title="Download"
					themeColors={themeColors}
				>
					<Download className="w-3.5 h-3.5" />
				</ToolbarButton>

				{onShare && (
					<button
						type="button"
						onClick={onShare}
						disabled={isSharing}
						className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold rounded-md transition-all duration-150 disabled:opacity-50 cursor-pointer"
						style={{
							background: themeColors.bgTertiary,
							color: themeColors.textMuted,
							border: `1px solid ${themeColors.border}`,
						}}
					>
						<Share2 className="w-3 h-3" />
						{isSharing ? "Sharing..." : "Share"}
					</button>
				)}
			</div>
		</header>
	);
}

function ToolbarButton({
	onClick,
	title,
	themeColors,
	children,
}: {
	onClick: () => void;
	title: string;
	themeColors: ThemeInfo["colors"];
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={title}
			className="w-7 h-7 flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer"
			style={{ color: themeColors.textMuted }}
			onMouseEnter={(e) => {
				e.currentTarget.style.background = `${themeColors.bgTertiary}`;
				e.currentTarget.style.color = themeColors.text;
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.background = "transparent";
				e.currentTarget.style.color = themeColors.textMuted;
			}}
		>
			{children}
		</button>
	);
}
