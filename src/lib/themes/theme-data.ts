export type ThemeName =
	| "vscode-dark"
	| "vscode-light"
	| "vercel-dark"
	| "vercel-light"
	| "github-dark"
	| "github-light"
	| "monokai-pro"
	| "dracula";

export interface ThemeInfo {
	name: ThemeName;
	label: string;
	isDark: boolean;
	colors: {
		bg: string;
		bgSecondary: string;
		bgTertiary: string;
		border: string;
		text: string;
		textMuted: string;
		accent: string;
		accentHover: string;
	};
}

export const themeInfo: Record<ThemeName, ThemeInfo> = {
	"vscode-dark": {
		name: "vscode-dark",
		label: "VS Code Dark+",
		isDark: true,
		colors: {
			bg: "#1e1e1e",
			bgSecondary: "#252526",
			bgTertiary: "#2d2d2d",
			border: "#3c3c3c",
			text: "#d4d4d4",
			textMuted: "#808080",
			accent: "#0078d4",
			accentHover: "#1a8cff",
		},
	},
	"vscode-light": {
		name: "vscode-light",
		label: "VS Code Light+",
		isDark: false,
		colors: {
			bg: "#ffffff",
			bgSecondary: "#f3f3f3",
			bgTertiary: "#e8e8e8",
			border: "#d4d4d4",
			text: "#333333",
			textMuted: "#6e6e6e",
			accent: "#0078d4",
			accentHover: "#0066b8",
		},
	},
	"vercel-dark": {
		name: "vercel-dark",
		label: "Vercel Dark",
		isDark: true,
		colors: {
			bg: "#000000",
			bgSecondary: "#0a0a0a",
			bgTertiary: "#111111",
			border: "#1f1f1f",
			text: "#fafafa",
			textMuted: "#737373",
			accent: "#ffffff",
			accentHover: "#a3a3a3",
		},
	},
	"vercel-light": {
		name: "vercel-light",
		label: "Vercel Light",
		isDark: false,
		colors: {
			bg: "#ffffff",
			bgSecondary: "#fafafa",
			bgTertiary: "#f5f5f5",
			border: "#e5e5e5",
			text: "#171717",
			textMuted: "#737373",
			accent: "#171717",
			accentHover: "#404040",
		},
	},
	"github-dark": {
		name: "github-dark",
		label: "GitHub Dark",
		isDark: true,
		colors: {
			bg: "#0d1117",
			bgSecondary: "#161b22",
			bgTertiary: "#21262d",
			border: "#30363d",
			text: "#e6edf3",
			textMuted: "#7d8590",
			accent: "#58a6ff",
			accentHover: "#79b8ff",
		},
	},
	"github-light": {
		name: "github-light",
		label: "GitHub Light",
		isDark: false,
		colors: {
			bg: "#ffffff",
			bgSecondary: "#f6f8fa",
			bgTertiary: "#eaeef2",
			border: "#d0d7de",
			text: "#1f2328",
			textMuted: "#656d76",
			accent: "#0969da",
			accentHover: "#0550ae",
		},
	},
	"monokai-pro": {
		name: "monokai-pro",
		label: "Monokai Pro",
		isDark: true,
		colors: {
			bg: "#2d2a2e",
			bgSecondary: "#363437",
			bgTertiary: "#403e41",
			border: "#5b595c",
			text: "#fcfcfa",
			textMuted: "#939293",
			accent: "#ffd866",
			accentHover: "#ffcc00",
		},
	},
	dracula: {
		name: "dracula",
		label: "Dracula",
		isDark: true,
		colors: {
			bg: "#282a36",
			bgSecondary: "#2d3039",
			bgTertiary: "#343746",
			border: "#44475a",
			text: "#f8f8f2",
			textMuted: "#6272a4",
			accent: "#bd93f9",
			accentHover: "#caa9fa",
		},
	},
};
