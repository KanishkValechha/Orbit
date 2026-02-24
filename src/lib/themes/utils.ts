import { type ThemeInfo, type ThemeName, themeInfo } from "./theme-data";

export function getThemeColors(theme: ThemeName): ThemeInfo["colors"] {
	return themeInfo[theme].colors;
}

export function getDarkThemes(): ThemeName[] {
	return Object.entries(themeInfo)
		.filter(([, info]) => info.isDark)
		.map(([name]) => name as ThemeName);
}

export function getLightThemes(): ThemeName[] {
	return Object.entries(themeInfo)
		.filter(([, info]) => !info.isDark)
		.map(([name]) => name as ThemeName);
}

export type { ThemeInfo, ThemeName };
export { themeInfo };
export { monacoThemes, registerMonacoThemes } from "./monaco-themes";
