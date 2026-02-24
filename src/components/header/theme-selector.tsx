import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ThemeInfo, ThemeName } from "#/lib/themes/theme-data";
import { themeInfo } from "#/lib/themes/theme-data";

interface ThemeSelectorProps {
	theme: ThemeName;
	themeColors: ThemeInfo["colors"];
	onThemeChange: (theme: ThemeName) => void;
}

export function ThemeSelector({
	theme,
	themeColors,
	onThemeChange,
}: ThemeSelectorProps) {
	const [showMenu, setShowMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setShowMenu(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const themes = Object.entries(themeInfo).map(([value, info]) => ({
		value,
		...info,
	}));

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				onClick={() => setShowMenu(!showMenu)}
				className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors"
				style={{
					background: themeColors.bgTertiary,
					color: themeColors.textMuted,
					border: `1px solid ${themeColors.border}`,
				}}
			>
				<div
					className="w-3 h-3 rounded-full"
					style={{
						background: themeInfo[theme].isDark
							? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
							: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
						border: `1px solid ${themeColors.border}`,
					}}
				/>
				{themeInfo[theme].label}
				<ChevronDown className="w-3 h-3" />
			</button>

			{showMenu && (
				<div
					className="absolute top-full right-0 mt-1 py-1 rounded-lg shadow-xl z-50 min-w-[160px]"
					style={{
						background: themeColors.bgSecondary,
						border: `1px solid ${themeColors.border}`,
						backdropFilter: "blur(12px)",
					}}
				>
					{themes.map((t) => (
						<button
							key={t.value}
							type="button"
							onClick={() => {
								onThemeChange(t.value as ThemeName);
								setShowMenu(false);
							}}
							className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors"
							style={{
								color:
									theme === t.value ? themeColors.text : themeColors.textMuted,
								background:
									theme === t.value ? `${themeColors.accent}15` : "transparent",
							}}
						>
							<div
								className="w-3 h-3 rounded-full shrink-0"
								style={{
									background: t.isDark
										? "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
										: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
									border: `1px solid ${themeColors.border}`,
								}}
							/>
							{t.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
