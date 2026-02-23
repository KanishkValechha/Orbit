import { Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { Select } from "#components/ui";
import { registerMonacoThemes, type ThemeName, themeInfo } from "#lib/themes";

interface ThemeToggleProps {
	value: ThemeName;
	onChange: (theme: ThemeName) => void;
}

const themeOptions = Object.entries(themeInfo).map(([value, info]) => ({
	value,
	label: info.label,
}));

export function ThemeToggle({ value, onChange }: ThemeToggleProps) {
	return (
		<div className="flex items-center gap-2">
			<Palette className="w-4 h-4 text-gray-400" />
			<Select
				value={value}
				onChange={(e) => onChange(e.target.value as ThemeName)}
				options={themeOptions}
				variant="ghost"
				size="sm"
				className="min-w-[140px]"
			/>
		</div>
	);
}

export function useThemeState() {
	const [theme, setTheme] = useState<ThemeName>(() => {
		if (typeof window !== "undefined") {
			return (
				(localStorage.getItem("orbit-theme") as ThemeName) || "vercel-dark"
			);
		}
		return "vercel-dark";
	});

	useEffect(() => {
		localStorage.setItem("orbit-theme", theme);
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme]);

	return { theme, setTheme };
}

export function useMonacoThemeSetup(
	monaco: typeof import("monaco-editor") | null,
) {
	useEffect(() => {
		if (monaco) {
			registerMonacoThemes(monaco);
		}
	}, [monaco]);
}
