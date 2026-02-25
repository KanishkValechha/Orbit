import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Toolbar } from "#/components/header/toolbar";
import { ThemeSelector } from "#/components/header/theme-selector";
import { CodeEditor } from "#/components/editor";
import { ConsoleOutput } from "#/components/output/console-output";
import { PreviewFrame } from "#/components/output/preview-frame";
import { OutputTabs } from "#/components/output/output-tabs";
import { StatusBar } from "#/components/footer/status-bar";
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
`;

export const Route = createFileRoute("/play/$id")({
	component: SharedPlayPage,
});

function SharedPlayPage() {
	const { id } = Route.useParams();
	const snippet = useQuery(api.snippets.get, { id: id as Id<"snippets"> });

	const [theme, setTheme] = useState<ThemeName>(() => {
		if (typeof window !== "undefined") {
			return (
				(localStorage.getItem("orbit-theme") as ThemeName) || "vercel-dark"
			);
		}
		return "vercel-dark";
	});

	const [code, setCode] = useState(DEFAULT_CODE);
	const [activeTab, setActiveTab] = useState<"console" | "preview">("console");
	const [messages, setMessages] = useState<ConsoleMessage[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [executionTime, setExecutionTime] = useState<number | null>(null);
	const [mode, setMode] = useState<ExecutionMode>("iframe");
	const [previewTheme, setPreviewTheme] = useState<ThemeName | null>(null);
	const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
	const [outputWidth, setOutputWidth] = useState(420);
	const isDragging = useRef(false);

	const activeTheme = previewTheme ?? theme;

	useEffect(() => {
		if (snippet?.code) {
			setCode(snippet.code);
		}
		if (snippet?.theme) {
			setTheme(snippet.theme as ThemeName);
		}
	}, [snippet]);

	useEffect(() => {
		localStorage.setItem("orbit-theme", theme);
	}, [theme]);

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
		setCode(snippet?.code || DEFAULT_CODE);
		setMessages([]);
	}, [snippet]);

	const handleResizeStart = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			isDragging.current = true;
			const startX = e.clientX;
			const startWidth = outputWidth;

			const handleMouseMove = (e: MouseEvent) => {
				if (!isDragging.current) return;
				const delta = startX - e.clientX;
				const newWidth = Math.max(280, Math.min(700, startWidth + delta));
				setOutputWidth(newWidth);
			};

			const handleMouseUp = () => {
				isDragging.current = false;
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
				document.body.style.cursor = "";
				document.body.style.userSelect = "";
			};

			document.body.style.cursor = "col-resize";
			document.body.style.userSelect = "none";
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		},
		[outputWidth],
	);

	const themeColors = themeInfo[activeTheme].colors;
	const errorCount = messages.filter((m) => m.type === "error").length;
	const warnCount = messages.filter((m) => m.type === "warn").length;

	if (snippet === undefined) {
		return (
			<div
				className="h-screen flex items-center justify-center"
				style={{ background: themeColors.bg, color: themeColors.textMuted }}
			>
				<div className="flex flex-col items-center gap-3">
					<div className="relative w-8 h-8">
						<div
							className="absolute inset-0 rounded-full orbit-spinner"
							style={{
								border: `2px solid ${themeColors.border}`,
								borderTopColor: themeColors.accent,
							}}
						/>
					</div>
					<span className="text-xs font-medium">Loading snippet...</span>
				</div>
			</div>
		);
	}

	if (snippet === null) {
		return (
			<div
				className="h-screen flex items-center justify-center"
				style={{ background: themeColors.bg, color: themeColors.textMuted }}
			>
				<div className="text-center">
					<p className="text-lg font-semibold mb-2">Snippet not found</p>
					<a
						href="/play"
						className="text-xs underline transition-colors"
						style={{ color: themeColors.accent }}
					>
						Go to playground
					</a>
				</div>
			</div>
		);
	}

	return (
		<div
			className="h-screen flex flex-col overflow-hidden relative"
			style={{ background: themeColors.bg }}
		>
			<Toolbar
				themeColors={themeColors}
				isRunning={isRunning}
				mode={mode}
				onRun={runCode}
				onReset={handleReset}
				onDownload={handleDownload}
				onModeChange={setMode}
			>
				<ThemeSelector
					theme={theme}
					themeColors={themeColors}
					onThemeChange={setTheme}
					onPreviewChange={setPreviewTheme}
				/>
			</Toolbar>

			<div className="flex-1 flex overflow-hidden relative z-1">
				<div className="flex-1 flex flex-col min-w-0">
					<CodeEditor
						code={code}
						theme={activeTheme}
						themeColors={themeColors}
						onChange={setCode}
						onCursorChange={setCursorPosition}
						onRun={runCode}
					/>
				</div>

				<div
					className="resize-handle w-[2px] shrink-0 relative z-10"
					style={{ background: themeColors.border }}
					onMouseDown={handleResizeStart}
				/>

				<div
					className="flex flex-col shrink-0"
					style={{ width: outputWidth }}
				>
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

			<StatusBar
				themeColors={themeColors}
				themeName={activeTheme}
				cursorPosition={cursorPosition}
				isRunning={isRunning}
				executionTime={executionTime}
				messageCount={messages.length}
			/>
		</div>
	);
}
