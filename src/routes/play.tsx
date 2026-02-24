import { createFileRoute } from "@tanstack/react-router";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Toolbar } from "#/components/header/toolbar";
import { ThemeSelector } from "#/components/header/theme-selector";
import { CodeEditor } from "#/components/editor";
import { ConsoleOutput } from "#/components/output/console-output";
import { PreviewFrame } from "#/components/output/preview-frame";
import { OutputTabs } from "#/components/output/output-tabs";
import {
	type ConsoleMessage,
	type ExecutionMode,
	executeCode,
} from "#/lib/sandbox/execute";
import { type ThemeName, themeInfo } from "#/lib/themes/theme-data";

const DEFAULT_CODE = `// Welcome to Orbit
// Write JavaScript or TypeScript and press Ctrl+Shift+Enter to run

function fibonacci(n: number): number[] {
  const seq: number[] = [0, 1]
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2])
  }
  return seq.slice(0, n)
}

console.log('Fibonacci sequence:')
console.log(fibonacci(10))

// Async example
async function simulateAsync(): Promise<void> {
  console.log('Starting async operation...')
  await new Promise(r => setTimeout(r, 300))
  console.log('Async complete!')
}

simulateAsync()
`;

export const Route = createFileRoute("/play")({
	component: PlayPage,
});

function PlayPage() {
	const createSnippet = useMutation(api.snippets.create);

	const [theme, setTheme] = useState<ThemeName>(() => {
		if (typeof window !== "undefined") {
			return (
				(localStorage.getItem("orbit-theme") as ThemeName) || "vercel-dark"
			);
		}
		return "vercel-dark";
	});

	const [code, setCode] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("orbit-draft") || DEFAULT_CODE;
		}
		return DEFAULT_CODE;
	});

	const [activeTab, setActiveTab] = useState<"console" | "preview">("console");
	const [messages, setMessages] = useState<ConsoleMessage[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	const [executionTime, setExecutionTime] = useState<number | null>(null);
	const [mode, setMode] = useState<ExecutionMode>("iframe");
	const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null);

	const activeTheme = previewTheme ?? theme;

	useEffect(() => {
		localStorage.setItem("orbit-theme", theme);
	}, [theme]);

	useEffect(() => {
		const timer = setTimeout(() => {
			localStorage.setItem("orbit-draft", code);
		}, 500);
		return () => clearTimeout(timer);
	}, [code]);

	const handleConsole = useCallback((message: ConsoleMessage) => {
		setMessages((prev) => [...prev, message]);
	}, []);

	const runCode = useCallback(async () => {
		setIsRunning(true);
		setMessages([]);
		setExecutionTime(null);

		const result = await executeCode(code, mode, handleConsole);

		setExecutionTime(result.executionTime);
		setIsRunning(false);

		if (result.error) {
			setMessages((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					type: "error" as const,
					args: [
						{
							name: result.error!.name,
							message: result.error!.message,
							stack: result.error!.stack,
						},
					],
					timestamp: Date.now(),
				},
			]);
		} else if (result.result !== undefined) {
			setMessages((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					type: "result" as const,
					args: [result.result],
					timestamp: Date.now(),
				},
			]);
		}
	}, [code, mode, handleConsole]);

	useHotkey("Mod+Shift+Enter", (e) => {
		e.preventDefault();
		runCode();
	});

	const handleShare = useCallback(async () => {
		setIsSharing(true);
		try {
			const id = await createSnippet({
				code,
				language: "typescript",
				theme,
			});
			const shareUrl = `${window.location.origin}/play/${id}`;
			await navigator.clipboard.writeText(shareUrl);
			setMessages((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					type: "info" as const,
					args: ["Share link copied to clipboard!"],
					timestamp: Date.now(),
				},
			]);
		} catch {
			setMessages((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					type: "error" as const,
					args: [{ name: "ShareError", message: "Failed to create share link" }],
					timestamp: Date.now(),
				},
			]);
		} finally {
			setIsSharing(false);
		}
	}, [code, theme, createSnippet]);

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
		setMessages([]);
	}, []);

	const themeColors = themeInfo[activeTheme].colors;
	const errorCount = messages.filter((m) => m.type === "error").length;
	const warnCount = messages.filter((m) => m.type === "warn").length;

	return (
		<div
			className="h-screen flex flex-col overflow-hidden"
			style={{ background: themeColors.bg }}
		>
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div
					className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-30"
					style={{
						background: `radial-gradient(circle, ${themeColors.accent}20 0%, transparent 70%)`,
						filter: "blur(60px)",
					}}
				/>
				<div
					className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
					style={{
						background: `radial-gradient(circle, ${themeColors.accent}15 0%, transparent 70%)`,
						filter: "blur(80px)",
					}}
				/>
			</div>

			<Toolbar
				themeColors={themeColors}
				isRunning={isRunning}
				mode={mode}
				onRun={runCode}
				onReset={handleReset}
				onDownload={handleDownload}
				onModeChange={setMode}
				onShare={handleShare}
				isSharing={isSharing}
			>
				<ThemeSelector
					theme={theme}
					themeColors={themeColors}
					onThemeChange={setTheme}
					onPreviewChange={setPreviewTheme}
				/>
			</Toolbar>

			<div className="flex-1 flex overflow-hidden relative">
				<div
					className="flex-1 flex flex-col min-w-0"
					style={{ borderRight: `1px solid ${themeColors.border}` }}
				>
					<CodeEditor
						code={code}
						theme={activeTheme}
						themeColors={themeColors}
						onChange={setCode}
					/>
				</div>

				<div className="w-[400px] flex flex-col shrink-0">
					<OutputTabs
						activeTab={activeTab}
						messageCount={messages.length}
						themeColors={themeColors}
						onTabChange={setActiveTab}
					/>

					<div className="flex-1 overflow-hidden">
						{activeTab === "console" ? (
							<ConsoleOutput
								messages={messages}
								executionTime={executionTime}
								errorCount={errorCount}
								warnCount={warnCount}
								onClear={() => setMessages([])}
								themeColors={themeColors}
							/>
						) : (
							<PreviewFrame code={code} themeColors={themeColors} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
