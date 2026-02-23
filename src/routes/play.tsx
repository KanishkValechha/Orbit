import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { createFileRoute } from "@tanstack/react-router";
import {
	AlertCircle,
	AlertTriangle,
	ChevronDown,
	Code2,
	Download,
	Info,
	Layout,
	Play,
	RotateCcw,
	Sparkles,
	Terminal,
} from "lucide-react";
import type * as Monaco from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	type ConsoleMessage,
	type ExecutionMode,
	executeCode,
} from "../lib/sandbox";
import { registerMonacoThemes, type ThemeName, themeInfo } from "../lib/themes";

const DEFAULT_CODE = `// Welcome to Orbit ✨
// Write JavaScript or TypeScript and press Ctrl/Cmd + Enter to run

function fibonacci(n: number): number[] {
  const seq = [0, 1]
  for (let i = 2; i < n; i++) {
    seq.push(seq[i - 1] + seq[i - 2])
  }
  return seq.slice(0, n)
}

console.log('Fibonacci sequence:')
console.log(fibonacci(10))

// Async example
async function simulateAsync() {
  console.log('Starting async operation...')
  await new Promise(r => setTimeout(r, 300))
  console.log('✓ Async complete!')
}

simulateAsync()
`;

export const Route = createFileRoute("/play")({
	component: PlayPage,
});

function PlayPage() {
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
	const [executionTime, setExecutionTime] = useState<number | null>(null);
	const [mode, setMode] = useState<ExecutionMode>("iframe");
	const [showThemeMenu, setShowThemeMenu] = useState(false);
	const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
	const themeMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		localStorage.setItem("orbit-theme", theme);
	}, [theme]);

	useEffect(() => {
		const timer = setTimeout(() => {
			localStorage.setItem("orbit-draft", code);
		}, 500);
		return () => clearTimeout(timer);
	}, [code]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				themeMenuRef.current &&
				!themeMenuRef.current.contains(e.target as Node)
			) {
				setShowThemeMenu(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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

	useEffect(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
				e.preventDefault();
				runCode();
			}
		};
		document.addEventListener("keydown", handleKeydown);
		return () => document.removeEventListener("keydown", handleKeydown);
	}, [runCode]);

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

	const handleBeforeMount: BeforeMount = useCallback((monaco) => {
		registerMonacoThemes(monaco);
		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			module: monaco.languages.typescript.ModuleKind.ESNext,
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			allowNonTsExtensions: true,
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
			strict: true,
			jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
			lib: ["esnext", "dom", "dom.iterable"],
		});
	}, []);

	const handleMount: OnMount = useCallback((editor) => {
		editorRef.current = editor;
		editor.getModel()?.updateOptions({ tabSize: 2 });
	}, []);

	const themeColors = themeInfo[theme].colors;
	const errorCount = messages.filter((m) => m.type === "error").length;
	const warnCount = messages.filter((m) => m.type === "warn").length;

	const themes = Object.entries(themeInfo).map(([value, info]) => ({
		value,
		...info,
	}));

	return (
		<div
			className="h-screen flex flex-col overflow-hidden"
			style={{ background: themeColors.bg }}
		>
			{/* Ambient background effects */}
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

			{/* Top toolbar */}
			<header
				className="relative flex items-center justify-between px-4 py-3 border-b z-10"
				style={{
					borderColor: themeColors.border,
					background: `linear-gradient(180deg, ${themeColors.bgSecondary}ee 0%, ${themeColors.bg}ee 100%)`,
					backdropFilter: "blur(12px)",
				}}
			>
				<div className="flex items-center gap-4">
					<div className="flex items-center gap-2.5">
						<div
							className="w-7 h-7 rounded-lg flex items-center justify-center"
							style={{
								background:
									"linear-gradient(135deg, #00d4ff 0%, #0066ff 50%, #a855f7 100%)",
								boxShadow: "0 4px 12px rgba(0, 212, 255, 0.25)",
							}}
						>
							<Code2 className="w-3.5 h-3.5 text-white" />
						</div>
						<span
							className="text-base font-semibold tracking-tight"
							style={{ color: themeColors.text }}
						>
							Orbit
						</span>
					</div>

					<div
						className="h-4 w-px"
						style={{ background: themeColors.border }}
					/>

					<button
						type="button"
						onClick={runCode}
						disabled={isRunning}
						className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
						style={{
							background: "linear-gradient(135deg, #00d4ff 0%, #0066ff 100%)",
							color: "white",
							boxShadow: "0 2px 8px rgba(0, 212, 255, 0.3)",
						}}
					>
						<Play className="w-3.5 h-3.5" />
						{isRunning ? "Running..." : "Run"}
					</button>

					<span className="text-xs" style={{ color: themeColors.textMuted }}>
						⌘ Enter
					</span>
				</div>

				<div className="flex items-center gap-2">
					{/* Mode selector */}
					<div className="relative">
						<select
							value={mode}
							onChange={(e) => setMode(e.target.value as ExecutionMode)}
							className="appearance-none text-xs rounded-md px-2.5 py-1.5 pr-7 cursor-pointer transition-colors outline-none"
							style={{
								background: themeColors.bgTertiary,
								color: themeColors.textMuted,
								border: `1px solid ${themeColors.border}`,
							}}
						>
							<option value="iframe">iframe</option>
							<option value="worker">Worker</option>
						</select>
						<ChevronDown
							className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
							style={{ color: themeColors.textMuted }}
						/>
					</div>

					{/* Theme selector */}
					<div className="relative" ref={themeMenuRef}>
						<button
							type="button"
							onClick={() => setShowThemeMenu(!showThemeMenu)}
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

						{showThemeMenu && (
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
											setTheme(t.value as ThemeName);
											setShowThemeMenu(false);
										}}
										className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors"
										style={{
											color:
												theme === t.value
													? themeColors.text
													: themeColors.textMuted,
											background:
												theme === t.value
													? `${themeColors.accent}15`
													: "transparent",
										}}
									>
										<div
											className="w-3 h-3 rounded-full flex-shrink-0"
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

					<div
						className="h-4 w-px"
						style={{ background: themeColors.border }}
					/>

					<button
						type="button"
						onClick={handleReset}
						className="p-1.5 rounded-md transition-colors"
						style={{ color: themeColors.textMuted }}
						title="Reset code"
					>
						<RotateCcw className="w-4 h-4" />
					</button>
					<button
						type="button"
						onClick={handleDownload}
						className="p-1.5 rounded-md transition-colors"
						style={{ color: themeColors.textMuted }}
						title="Download code"
					>
						<Download className="w-4 h-4" />
					</button>
				</div>
			</header>

			{/* Main content */}
			<div className="flex-1 flex overflow-hidden relative">
				{/* Editor */}
				<div
					className="flex-1 flex flex-col min-w-0"
					style={{ borderRight: `1px solid ${themeColors.border}` }}
				>
					<Editor
						height="100%"
						language="typescript"
						value={code}
						theme={theme}
						onChange={(v) => setCode(v ?? "")}
						beforeMount={handleBeforeMount}
						onMount={handleMount}
						loading={
							<div
								className="flex items-center justify-center h-full"
								style={{ background: themeColors.bg }}
							>
								<div
									className="flex items-center gap-3"
									style={{ color: themeColors.textMuted }}
								>
									<div
										className="w-4 h-4 border-2 rounded-full animate-spin"
										style={{
											borderColor: `${themeColors.accent}40`,
											borderTopColor: themeColors.accent,
										}}
									/>
									<span className="text-sm">Loading editor...</span>
								</div>
							</div>
						}
						options={{
							lineNumbers: "on",
							minimap: { enabled: false },
							wordWrap: "on",
							fontSize: 14,
							fontFamily:
								"'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
							fontLigatures: true,
							scrollBeyondLastLine: false,
							smoothScrolling: true,
							cursorBlinking: "smooth",
							cursorSmoothCaretAnimation: "on",
							padding: { top: 16, bottom: 16 },
							renderLineHighlight: "all",
							bracketPairColorization: { enabled: true },
							guides: { bracketPairs: true, indentation: true },
							automaticLayout: true,
							fixedOverflowWidgets: true,
							overviewRulerBorder: false,
							hideCursorInOverviewRuler: true,
							scrollbar: {
								vertical: "auto",
								horizontal: "auto",
								verticalScrollbarSize: 8,
								horizontalScrollbarSize: 8,
							},
						}}
					/>
				</div>

				{/* Output Panel */}
				<div className="w-[400px] flex flex-col flex-shrink-0">
					{/* Tabs */}
					<div
						className="flex border-b"
						style={{ borderColor: themeColors.border }}
					>
						<button
							type="button"
							onClick={() => setActiveTab("console")}
							className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
							style={{
								color:
									activeTab === "console"
										? themeColors.text
										: themeColors.textMuted,
							}}
						>
							<Terminal className="w-4 h-4" />
							Console
							{messages.length > 0 && (
								<span
									className="px-1.5 py-0.5 text-xs rounded"
									style={{
										background: `${themeColors.accent}20`,
										color: themeColors.accent,
									}}
								>
									{messages.length}
								</span>
							)}
							{activeTab === "console" && (
								<div
									className="absolute bottom-0 left-0 right-0 h-0.5"
									style={{ background: themeColors.accent }}
								/>
							)}
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("preview")}
							className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
							style={{
								color:
									activeTab === "preview"
										? themeColors.text
										: themeColors.textMuted,
							}}
						>
							<Layout className="w-4 h-4" />
							Preview
							{activeTab === "preview" && (
								<div
									className="absolute bottom-0 left-0 right-0 h-0.5"
									style={{ background: themeColors.accent }}
								/>
							)}
						</button>
					</div>

					{/* Output content */}
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

function ConsoleOutput({
	messages,
	executionTime,
	errorCount,
	warnCount,
	onClear,
	themeColors,
}: {
	messages: ConsoleMessage[];
	executionTime: number | null;
	errorCount: number;
	warnCount: number;
	onClear: () => void;
	themeColors: (typeof themeInfo)["vercel-dark"]["colors"];
}) {
	const typeConfig = {
		log: { icon: Terminal, color: themeColors.textMuted },
		info: { icon: Info, color: "#00d4ff" },
		warn: { icon: AlertTriangle, color: "#fbbf24" },
		error: { icon: AlertCircle, color: "#ef4444" },
		result: { icon: Sparkles, color: "#10b981" },
	};

	if (messages.length === 0) {
		return (
			<div
				className="flex flex-col items-center justify-center h-full"
				style={{ color: themeColors.textMuted }}
			>
				<Terminal className="w-8 h-8 mb-3 opacity-40" />
				<p className="text-sm">Console output will appear here</p>
				<p className="text-xs mt-1 opacity-60">Press ⌘ Enter to run code</p>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			<div
				className="flex items-center justify-between px-3 py-2 border-b"
				style={{ borderColor: themeColors.border }}
			>
				<div className="flex items-center gap-2">
					{executionTime !== null && (
						<span
							className="text-xs font-mono px-1.5 py-0.5 rounded"
							style={{
								background: `${themeColors.accent}15`,
								color: themeColors.textMuted,
							}}
						>
							{executionTime.toFixed(1)}ms
						</span>
					)}
					{errorCount > 0 && (
						<span
							className="text-xs px-1.5 py-0.5 rounded"
							style={{
								background: "rgba(239, 68, 68, 0.15)",
								color: "#ef4444",
							}}
						>
							{errorCount} error{errorCount > 1 ? "s" : ""}
						</span>
					)}
					{warnCount > 0 && (
						<span
							className="text-xs px-1.5 py-0.5 rounded"
							style={{
								background: "rgba(251, 191, 36, 0.15)",
								color: "#fbbf24",
							}}
						>
							{warnCount} warn
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={onClear}
					className="text-xs transition-colors"
					style={{ color: themeColors.textMuted }}
				>
					Clear
				</button>
			</div>
			<div className="flex-1 overflow-auto font-mono text-sm">
				{messages.map((msg) => {
					const config = typeConfig[msg.type];
					const Icon = config.icon;

					return (
						<div
							key={msg.id}
							className="flex gap-2.5 px-3 py-2 border-b transition-colors"
							style={{ borderColor: `${themeColors.border}50` }}
						>
							<Icon
								className="w-4 h-4 flex-shrink-0 mt-0.5"
								style={{ color: config.color }}
							/>
							<div className="flex-1 min-w-0">
								<pre
									className="whitespace-pre-wrap break-all text-xs leading-relaxed"
									style={{ color: themeColors.text }}
								>
									{msg.args.map((arg: unknown, i: number) => (
										<span key={`${msg.id}-${i}`}>
											{i > 0 && " "}
											{formatValue(arg)}
										</span>
									))}
								</pre>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function PreviewFrame({
	code,
	themeColors,
}: {
	code: string;
	themeColors: (typeof themeInfo)["vercel-dark"]["colors"];
}) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      color: #e5e5e5;
      min-height: 100vh;
      padding: 24px;
    }
    #root { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    try { ${code} } catch(e) { console.error(e); }
  </script>
</body>
</html>
  `;

	return (
		<iframe
			ref={iframeRef}
			srcDoc={html}
			sandbox="allow-scripts"
			className="w-full h-full border-0"
			style={{ background: themeColors.bg }}
			title="Preview"
		/>
	);
}

function formatValue(value: unknown): string {
	if (value === null) return "null";
	if (value === undefined) return "undefined";
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean")
		return String(value);
	if (typeof value === "function") return value.toString();
	if (typeof value === "object") {
		const obj = value as Record<string, unknown>;
		if (obj.name && obj.message) {
			return `${obj.name}: ${obj.message}${obj.stack ? `\n${obj.stack}` : ""}`;
		}
		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return String(value);
		}
	}
	return String(value);
}
