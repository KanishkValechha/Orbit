import { Download, Loader2, Play, RotateCcw, Share2, Zap } from "lucide-react";
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
			className="relative flex items-center justify-between px-4 h-12 z-10 glass-panel shrink-0"
			style={{
				borderBottom: `1px solid ${themeColors.border}`,
				background: `${themeColors.bgSecondary}e6`,
			}}
		>
			{/* Left: Logo + Run */}
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<div
						className="w-6 h-6 rounded-md flex items-center justify-center"
						style={{
							background:
								"linear-gradient(135deg, #00d4ff 0%, #0066ff 50%, #a855f7 100%)",
							boxShadow: "0 2px 8px rgba(0, 102, 255, 0.3)",
						}}
					>
						<Zap className="w-3 h-3 text-white" strokeWidth={2.5} />
					</div>
					<span
						className="text-sm font-bold tracking-tight"
						style={{ color: themeColors.text }}
					>
						orbit
					</span>
				</div>

				<div
					className="h-5 w-px opacity-50"
					style={{ background: themeColors.border }}
				/>

				<button
					type="button"
					onClick={onRun}
					disabled={isRunning}
					className="flex items-center gap-1.5 h-7 px-3 text-xs font-semibold rounded-md transition-all duration-200 disabled:opacity-60 cursor-pointer"
					style={{
						background: isRunning
							? themeColors.bgTertiary
							: "linear-gradient(135deg, #00c6fb 0%, #005bea 100%)",
						color: isRunning ? themeColors.textMuted : "white",
						boxShadow: isRunning
							? "none"
							: "0 1px 8px rgba(0, 91, 234, 0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
						border: isRunning
							? `1px solid ${themeColors.border}`
							: "1px solid transparent",
					}}
				>
					{isRunning ? (
						<Loader2 className="w-3 h-3 orbit-spinner" />
					) : (
						<Play className="w-3 h-3" fill="currentColor" />
					)}
					{isRunning ? "Running" : "Run"}
				</button>

				<kbd
					className="hidden sm:inline-flex items-center gap-0.5 h-5 px-1.5 text-[10px] font-mono rounded"
					style={{
						background: `${themeColors.bgTertiary}80`,
						color: themeColors.textMuted,
						border: `1px solid ${themeColors.border}50`,
					}}
				>
					Ctrl+Shift+Enter
				</kbd>
			</div>

			{/* Right: Controls */}
			<div className="flex items-center gap-1.5">
				<div
					className="flex items-center h-7 rounded-md overflow-hidden"
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
