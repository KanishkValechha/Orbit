import { createFileRoute } from "@tanstack/react-router";
import { Download, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CodeEditor, ThemeToggle, useThemeState } from "../components/editor";
import { OutputPanel } from "../components/output";
import { Panel } from "../components/ui";
import { type ThemeName, themeInfo } from "../lib/themes";

const DEFAULT_CODE = `// Welcome to Orbit Playground! 🚀
// Write JavaScript or TypeScript code and hit Run

function greet(name: string) {
  return \`Hello, \${name}!\`
}

console.log(greet('World'))
console.log('Welcome to Orbit Playground')

// Try some async code
async function fetchExample() {
  console.log('Fetching data...')
  await new Promise(r => setTimeout(r, 500))
  console.log('Data fetched!')
}

fetchExample()
`;

export const Route = createFileRoute("/play")({
	component: PlayPage,
});

function PlayPage() {
	const { theme, setTheme } = useThemeState();
	const [code, setCode] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("orbit-draft") || DEFAULT_CODE;
		}
		return DEFAULT_CODE;
	});

	useEffect(() => {
		const timer = setTimeout(() => {
			localStorage.setItem("orbit-draft", code);
		}, 500);
		return () => clearTimeout(timer);
	}, [code]);

	const handleDownload = useCallback(() => {
		const blob = new Blob([code], { type: "text/typescript" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "playground.ts";
		a.click();
		URL.revokeObjectURL(url);
	}, [code]);

	const handleReset = useCallback(() => {
		setCode(DEFAULT_CODE);
	}, []);

	const themeColors = themeInfo[theme as ThemeName].colors;

	return (
		<div
			className="h-[calc(100vh-56px)] flex flex-col"
			style={{
				background: `linear-gradient(180deg, ${themeColors.bg} 0%, ${themeColors.bgSecondary} 100%)`,
			}}
		>
			<div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
				<div className="flex items-center gap-3">
					<h1 className="text-sm font-medium text-gray-200">Playground</h1>
					<span className="text-xs text-gray-500">Draft (auto-saved)</span>
				</div>
				<div className="flex items-center gap-2">
					<ThemeToggle value={theme as ThemeName} onChange={setTheme} />
					<div className="w-px h-5 bg-white/10 mx-1" />
					<button
						type="button"
						onClick={handleReset}
						className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
						title="Reset code"
					>
						<RotateCcw className="w-4 h-4" />
					</button>
					<button
						type="button"
						onClick={handleDownload}
						className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
						title="Download code"
					>
						<Download className="w-4 h-4" />
					</button>
				</div>
			</div>

			<div className="flex-1 flex overflow-hidden">
				<div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
					<Panel variant="glass" className="flex-1 rounded-none border-0">
						<CodeEditor
							value={code}
							onChange={setCode}
							language="typescript"
							theme={theme as ThemeName}
						/>
					</Panel>
				</div>

				<div className="w-[420px] flex-shrink-0 flex flex-col">
					<OutputPanel code={code} className="flex-1 rounded-none border-0" />
				</div>
			</div>
		</div>
	);
}
