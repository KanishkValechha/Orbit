import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ThemeInfo, ThemeName } from "#/lib/themes/theme-data";
import { themeInfo } from "#/lib/themes/theme-data";

interface ThemeSelectorProps {
	theme: ThemeName;
	themeColors: ThemeInfo["colors"];
	onThemeChange: (theme: ThemeName) => void;
	onPreviewChange?: (theme: ThemeName | null) => void;
}

const themeList = Object.entries(themeInfo).map(([value, info]) => ({
	value: value as ThemeName,
	...info,
}));

export function ThemeSelector({
	theme,
	themeColors,
	onThemeChange,
	onPreviewChange,
}: ThemeSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const menuRef = useRef<HTMLDivElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	const currentIndex = themeList.findIndex((t) => t.value === theme);

	useEffect(() => {
		if (isOpen) {
			setHighlightedIndex(currentIndex);
		}
	}, [isOpen, currentIndex]);

	useEffect(() => {
		if (isOpen && highlightedIndex >= 0) {
			onPreviewChange?.(themeList[highlightedIndex].value);
		} else if (!isOpen) {
			onPreviewChange?.(null);
		}
	}, [isOpen, highlightedIndex, onPreviewChange]);

	const closeMenu = useCallback(() => {
		setIsOpen(false);
		setHighlightedIndex(-1);
		onPreviewChange?.(null);
	}, [onPreviewChange]);

	const selectTheme = useCallback(
		(themeName: ThemeName) => {
			onThemeChange(themeName);
			closeMenu();
		},
		[onThemeChange, closeMenu]
	);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				closeMenu();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [closeMenu]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!isOpen) {
				if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
					e.preventDefault();
					setIsOpen(true);
				}
				return;
			}

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setHighlightedIndex((prev) =>
						prev < themeList.length - 1 ? prev + 1 : 0
					);
					break;
				case "ArrowUp":
					e.preventDefault();
					setHighlightedIndex((prev) =>
						prev > 0 ? prev - 1 : themeList.length - 1
					);
					break;
				case "Enter":
					e.preventDefault();
					if (highlightedIndex >= 0) {
						selectTheme(themeList[highlightedIndex].value);
					}
					break;
				case "Escape":
					e.preventDefault();
					closeMenu();
					buttonRef.current?.focus();
					break;
				case "Tab":
					closeMenu();
					break;
			}
		},
		[isOpen, highlightedIndex, selectTheme, closeMenu]
	);

	return (
		<div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
			<button
				ref={buttonRef}
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors"
				style={{
					background: themeColors.bgTertiary,
					color: themeColors.textMuted,
					border: `1px solid ${themeColors.border}`,
				}}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
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

			{isOpen && (
				<div
					className="absolute top-full right-0 mt-1 py-1 rounded-lg shadow-xl z-50 min-w-[160px]"
					style={{
						background: themeColors.bgSecondary,
						border: `1px solid ${themeColors.border}`,
						backdropFilter: "blur(12px)",
					}}
					role="listbox"
					aria-activedescendant={
						highlightedIndex >= 0
							? `theme-option-${themeList[highlightedIndex].value}`
							: undefined
					}
				>
					{themeList.map((t, index) => {
						const isHighlighted = index === highlightedIndex;
						const isSelected = theme === t.value;

						return (
							<button
								key={t.value}
								id={`theme-option-${t.value}`}
								type="button"
								role="option"
								aria-selected={isSelected}
								onClick={() => selectTheme(t.value)}
								onMouseEnter={() => setHighlightedIndex(index)}
								className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors"
								style={{
									color: isHighlighted || isSelected
										? themeColors.text
										: themeColors.textMuted,
									background: isHighlighted
										? `${themeColors.accent}20`
										: isSelected
											? `${themeColors.accent}10`
											: "transparent",
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
						);
					})}
				</div>
			)}
		</div>
	);
}
