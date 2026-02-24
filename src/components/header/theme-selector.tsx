import { Check, ChevronDown, Moon, Sun } from "lucide-react";
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

const darkThemes = themeList.filter((t) => t.isDark);
const lightThemes = themeList.filter((t) => !t.isDark);
// Display order matches UI: dark group first, then light group (for keyboard nav)
const displayOrderedThemes = [...darkThemes, ...lightThemes];

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

	const currentIndex = displayOrderedThemes.findIndex((t) => t.value === theme);

	useEffect(() => {
		if (isOpen) {
			setHighlightedIndex(currentIndex);
		}
	}, [isOpen, currentIndex]);

	useEffect(() => {
		if (isOpen && highlightedIndex >= 0) {
			onPreviewChange?.(displayOrderedThemes[highlightedIndex].value);
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
		[onThemeChange, closeMenu],
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
						prev < displayOrderedThemes.length - 1 ? prev + 1 : 0,
					);
					break;
				case "ArrowUp":
					e.preventDefault();
					setHighlightedIndex((prev) =>
						prev > 0 ? prev - 1 : displayOrderedThemes.length - 1,
					);
					break;
				case "Enter":
					e.preventDefault();
					if (highlightedIndex >= 0) {
						selectTheme(displayOrderedThemes[highlightedIndex].value);
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
		[isOpen, highlightedIndex, selectTheme, closeMenu],
	);

	const currentTheme = themeInfo[theme];

	return (
		<div className="relative" ref={menuRef} onKeyDown={handleKeyDown}>
			<button
				ref={buttonRef}
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 h-7 px-2.5 text-[11px] font-medium rounded-md transition-all duration-150 cursor-pointer"
				style={{
					background: themeColors.bgTertiary,
					color: themeColors.textMuted,
					border: `1px solid ${themeColors.border}`,
				}}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
			>
				<ThemeSwatch colors={themeColors} size={10} />
				<span className="max-w-[80px] truncate">{currentTheme.label}</span>
				<ChevronDown
					className="w-3 h-3 transition-transform duration-150"
					style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
				/>
			</button>

			{isOpen && (
				<div
					className="absolute top-full right-0 mt-1.5 py-1 rounded-lg shadow-2xl z-50 w-[200px] animate-scale-in"
					style={{
						background: themeColors.bgSecondary,
						border: `1px solid ${themeColors.border}`,
						boxShadow: `0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px ${themeColors.border}`,
					}}
					role="listbox"
					aria-activedescendant={
						highlightedIndex >= 0
							? `theme-option-${displayOrderedThemes[highlightedIndex].value}`
							: undefined
					}
				>
					<ThemeGroup
						label="Dark"
						icon={<Moon className="w-3 h-3" />}
						themes={darkThemes}
						selectedTheme={theme}
						highlightedIndex={highlightedIndex}
						themeColors={themeColors}
						onSelect={selectTheme}
						onHighlight={setHighlightedIndex}
						allThemes={displayOrderedThemes}
					/>

					<div
						className="mx-2 my-1 h-px"
						style={{ background: themeColors.border }}
					/>

					<ThemeGroup
						label="Light"
						icon={<Sun className="w-3 h-3" />}
						themes={lightThemes}
						selectedTheme={theme}
						highlightedIndex={highlightedIndex}
						themeColors={themeColors}
						onSelect={selectTheme}
						onHighlight={setHighlightedIndex}
						allThemes={displayOrderedThemes}
					/>
				</div>
			)}
		</div>
	);
}

function ThemeGroup({
	label,
	icon,
	themes,
	selectedTheme,
	highlightedIndex,
	themeColors,
	onSelect,
	onHighlight,
	allThemes,
}: {
	label: string;
	icon: React.ReactNode;
	themes: typeof themeList;
	selectedTheme: ThemeName;
	highlightedIndex: number;
	themeColors: ThemeInfo["colors"];
	onSelect: (t: ThemeName) => void;
	onHighlight: (i: number) => void;
	allThemes: typeof themeList;
}) {
	return (
		<div>
			<div
				className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
				style={{ color: themeColors.textMuted }}
			>
				{icon}
				{label}
			</div>
			{themes.map((t) => {
				const globalIndex = allThemes.findIndex(
					(at) => at.value === t.value,
				);
				const isHighlighted = globalIndex === highlightedIndex;
				const isSelected = selectedTheme === t.value;

				return (
					<button
						key={t.value}
						id={`theme-option-${t.value}`}
						type="button"
						role="option"
						aria-selected={isSelected}
						onClick={() => onSelect(t.value)}
						onMouseEnter={() => onHighlight(globalIndex)}
						className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[11px] text-left transition-all duration-100 cursor-pointer"
						style={{
							color:
								isHighlighted || isSelected
									? themeColors.text
									: themeColors.textMuted,
							background: isHighlighted
								? `${themeColors.accent}15`
								: "transparent",
							borderRadius: "4px",
							margin: "0 4px",
							width: "calc(100% - 8px)",
						}}
					>
						<ThemeSwatch colors={t.colors} size={12} />
						<span className="flex-1 truncate">{t.label}</span>
						{isSelected && (
							<Check
								className="w-3 h-3 shrink-0"
								style={{ color: themeColors.accent }}
							/>
						)}
					</button>
				);
			})}
		</div>
	);
}

function ThemeSwatch({
	colors,
	size = 12,
}: { colors: ThemeInfo["colors"]; size?: number }) {
	return (
		<div
			className="rounded-sm shrink-0 overflow-hidden flex"
			style={{
				width: size,
				height: size,
				border: `1px solid ${colors.border}`,
			}}
		>
			<div className="w-1/2 h-full" style={{ background: colors.bg }} />
			<div
				className="w-1/2 h-full"
				style={{ background: colors.accent }}
			/>
		</div>
	);
}
