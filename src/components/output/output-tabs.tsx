import { Layout, Terminal } from "lucide-react";
import type { ThemeInfo } from "#/lib/themes/theme-data";

interface OutputTabsProps {
	activeTab: "console" | "preview";
	messageCount: number;
	themeColors: ThemeInfo["colors"];
	onTabChange: (tab: "console" | "preview") => void;
}

export function OutputTabs({
	activeTab,
	messageCount,
	themeColors,
	onTabChange,
}: OutputTabsProps) {
	return (
		<div
			className="flex border-b"
			style={{ borderColor: themeColors.border }}
		>
			<button
				type="button"
				onClick={() => onTabChange("console")}
				className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
				style={{
					color:
						activeTab === "console"
							? themeColors.text
							: themeColors.textMuted,
				}}
			>
				<Terminal className="w-4 h-4" />
				Console
				{messageCount > 0 && (
					<span
						className="px-1.5 py-0.5 text-xs rounded"
						style={{
							background: `${themeColors.accent}20`,
							color: themeColors.accent,
						}}
					>
						{messageCount}
					</span>
				)}
				{activeTab === "console" && (
					<div
						className="absolute bottom-0 left-0 right-0 h-0.5"
						style={{ background: themeColors.accent }}
					/>
				)}
			</button>
			<button
				type="button"
				onClick={() => onTabChange("preview")}
				className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
				style={{
					color:
						activeTab === "preview"
							? themeColors.text
							: themeColors.textMuted,
				}}
			>
				<Layout className="w-4 h-4" />
				Preview
				{activeTab === "preview" && (
					<div
						className="absolute bottom-0 left-0 right-0 h-0.5"
						style={{ background: themeColors.accent }}
					/>
				)}
			</button>
		</div>
	);
}
