import { Circle } from "lucide-react";
import type { ThemeInfo, ThemeName } from "#/lib/themes/theme-data";
import { themeInfo } from "#/lib/themes/theme-data";

interface StatusBarProps {
	themeColors: ThemeInfo["colors"];
	themeName: ThemeName;
	cursorPosition: { line: number; column: number };
	isRunning: boolean;
	executionTime: number | null;
	messageCount: number;
}

export function StatusBar({
	themeColors,
	themeName,
	cursorPosition,
	isRunning,
	executionTime,
	messageCount,
}: StatusBarProps) {
	return (
		<footer
			className="flex items-center justify-between h-6 px-3 text-[10px] font-medium shrink-0 select-none z-10"
			style={{
				background: themeColors.bgSecondary,
				borderTop: `1px solid ${themeColors.border}`,
				color: themeColors.textMuted,
			}}
		>
			{/* Left side */}
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-1.5">
					<Circle
						className="w-2 h-2"
						fill={isRunning ? "#facc15" : "#34d399"}
						strokeWidth={0}
					/>
					<span>{isRunning ? "Running" : "Ready"}</span>
				</div>

				{executionTime !== null && (
					<span className="font-mono opacity-70">
						{executionTime.toFixed(1)}ms
					</span>
				)}

				{messageCount > 0 && (
					<span className="opacity-70">
						{messageCount} log{messageCount !== 1 ? "s" : ""}
					</span>
				)}
			</div>

			{/* Right side */}
			<div className="flex items-center gap-3">
				<span className="font-mono">
					Ln {cursorPosition.line}, Col {cursorPosition.column}
				</span>
				<span>TypeScript</span>
				<span>{themeInfo[themeName].label}</span>
			</div>
		</footer>
	);
}
