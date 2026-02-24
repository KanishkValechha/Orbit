import { Eye, Terminal } from "lucide-react";
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
			className="flex items-center h-9 px-1 gap-0.5 shrink-0"
			style={{
				borderBottom: `1px solid ${themeColors.border}`,
				background: themeColors.bgSecondary,
			}}
		>
			<TabButton
				active={activeTab === "console"}
				onClick={() => onTabChange("console")}
				themeColors={themeColors}
				icon={<Terminal className="w-3.5 h-3.5" />}
				label="Console"
				badge={messageCount > 0 ? messageCount : undefined}
			/>
			<TabButton
				active={activeTab === "preview"}
				onClick={() => onTabChange("preview")}
				themeColors={themeColors}
				icon={<Eye className="w-3.5 h-3.5" />}
				label="Preview"
			/>
		</div>
	);
}

function TabButton({
	active,
	onClick,
	themeColors,
	icon,
	label,
	badge,
}: {
	active: boolean;
	onClick: () => void;
	themeColors: ThemeInfo["colors"];
	icon: React.ReactNode;
	label: string;
	badge?: number;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex items-center gap-1.5 h-7 px-2.5 text-[11px] font-semibold rounded-md transition-all duration-150 cursor-pointer relative"
			style={{
				color: active ? themeColors.text : themeColors.textMuted,
				background: active ? `${themeColors.accent}12` : "transparent",
			}}
		>
			{icon}
			{label}
			{badge !== undefined && (
				<span
					className="ml-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold rounded-full"
					style={{
						background: `${themeColors.accent}20`,
						color: themeColors.accent,
					}}
				>
					{badge}
				</span>
			)}
		</button>
	);
}
