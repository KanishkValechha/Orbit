import { ChevronDown, Code2, Download, Play, RotateCcw } from "lucide-react";
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
	children,
}: ToolbarProps) {
	return (
		<header
			className="relative flex items-center justify-between px-4 py-3 border-b z-10"
			style={{
				borderColor: themeColors.border,
				background: `linear-gradient(180deg, ${themeColors.bgSecondary}ee 0%, ${themeColors.bg}ee 100%)`,
				backdropFilter: "blur(12px)",
			}}
		>
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2.5">
					<div
						className="w-7 h-7 rounded-lg flex items-center justify-center"
						style={{
							background:
								"linear-gradient(135deg, #00d4ff 0%, #0066ff 50%, #a855f7 100%)",
							boxShadow: "0 4px 12px rgba(0, 212, 255, 0.25)",
						}}
					>
						<Code2 className="w-3.5 h-3.5 text-white" />
					</div>
					<span
						className="text-base font-semibold tracking-tight"
						style={{ color: themeColors.text }}
					>
						Orbit
					</span>
				</div>

				<div
					className="h-4 w-px"
					style={{ background: themeColors.border }}
				/>

				<button
					type="button"
					onClick={onRun}
					disabled={isRunning}
					className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
					style={{
						background: "linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)",
						color: "white",
						boxShadow: "0 2px 8px rgba(0, 212, 255, 0.3)",
					}}
				>
					<Play className="w-3.5 h-3.5" />
					{isRunning ? "Running..." : "Run"}
				</button>

				<span className="text-xs" style={{ color: themeColors.textMuted }}>
					⌘⇧ Enter
				</span>
			</div>

			<div className="flex items-center gap-2">
				<div className="relative">
					<select
						value={mode}
						onChange={(e) => onModeChange(e.target.value as ExecutionMode)}
						className="appearance-none text-xs rounded-md px-2.5 py-1.5 pr-7 cursor-pointer transition-colors outline-none"
						style={{
							background: themeColors.bgTertiary,
							color: themeColors.textMuted,
							border: `1px solid ${themeColors.border}`,
						}}
					>
						<option value="iframe">iframe</option>
						<option value="worker">Worker</option>
					</select>
					<ChevronDown
						className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
						style={{ color: themeColors.textMuted }}
					/>
				</div>

				{children}

				<div
					className="h-4 w-px"
					style={{ background: themeColors.border }}
				/>

				<button
					type="button"
					onClick={onReset}
					className="p-1.5 rounded-md transition-colors"
					style={{ color: themeColors.textMuted }}
					title="Reset code"
				>
					<RotateCcw className="w-4 h-4" />
				</button>
				<button
					type="button"
					onClick={onDownload}
					className="p-1.5 rounded-md transition-colors"
					style={{ color: themeColors.textMuted }}
					title="Download code"
				>
					<Download className="w-4 h-4" />
				</button>
			</div>
		</header>
	);
}
