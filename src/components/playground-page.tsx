import type { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { CodeEditor } from "./editor";
import { Toolbar } from "./header/toolbar";
import { OutputPanel } from "./output/output-panel";
import { DEFAULT_CODE } from "../lib/constants";
import { executeCode, type ConsoleMessage, type ExecutionMode } from "../lib/sandbox";
import { type ThemeName, themeInfo } from "../lib/themes";

interface PlaygroundPageProps {
	initialCode?: string;
	initialTheme?: ThemeName;
	draftStorageKey?: string;
}

const THEME_STORAGE_KEY = "orbit-theme";

function getInitialTheme(initialTheme?: ThemeName): ThemeName {
	if (typeof window === "undefined") return initialTheme ?? "vercel-dark";
	return initialTheme ?? (localStorage.getItem(THEME_STORAGE_KEY) as ThemeName) ?? "vercel-dark";
}

function getInitialCode(initialCode: string | undefined, storageKey: string): string {
	if (typeof window === "undefined") return initialCode ?? DEFAULT_CODE;
	return localStorage.getItem(storageKey) ?? initialCode ?? DEFAULT_CODE;
}

export function PlaygroundPage({
	initialCode,
	initialTheme,
	draftStorageKey = "orbit-draft",
}: PlaygroundPageProps) {
	const [theme, setTheme] = useState<ThemeName>(() => getInitialTheme(initialTheme));
	const [code, setCode] = useState(() => getInitialCode(initialCode, draftStorageKey));
	const [activeTab, setActiveTab] = useState<"console" | "preview">("console");
	const [messages, setMessages] = useState<ConsoleMessage[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [isSharing, setIsSharing] = useState(false);
	const [shareStatus, setShareStatus] = useState<string | null>(null);
	const [executionTime, setExecutionTime] = useState<number | null>(null);
	const [mode, setMode] = useState<ExecutionMode>("iframe");
	const createSnippet = useMutation(api.snippets.create);

	useEffect(() => {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	}, [theme]);

	useEffect(() => {
		const timer = setTimeout(() => {
			localStorage.setItem(draftStorageKey, code);
		}, 500);
		return () => clearTimeout(timer);
	}, [code, draftStorageKey]);

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
					type: "error",
					args: [
						{
							name: result.error.name,
							message: result.error.message,
							stack: result.error.stack,
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
					type: "result",
					args: [result.result],
					timestamp: Date.now(),
				},
			]);
		}
	}, [code, handleConsole, mode]);

	const handleShare = useCallback(async () => {
		setIsSharing(true);
		setShareStatus(null);
		try {
			const id = await createSnippet({ code, language: "typescript", theme }) as Id<"snippets">;
			const shareUrl = `${window.location.origin}/play/${id}`;
			await navigator.clipboard.writeText(shareUrl);
			setShareStatus("Share link copied to clipboard");
		} catch {
			setShareStatus("Could not create share link");
		} finally {
			setIsSharing(false);
		}
	}, [code, createSnippet, theme]);

	const handleDownload = useCallback(() => {
		const blob = new Blob([code], { type: "text/typescript" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "playground.ts";
		anchor.click();
		URL.revokeObjectURL(url);
	}, [code]);

	const handleReset = useCallback(() => {
		setCode(DEFAULT_CODE);
		setMessages([]);
	}, []);

	const themeColors = themeInfo[theme].colors;
	const errorCount = messages.filter((message) => message.type === "error").length;
	const warnCount = messages.filter((message) => message.type === "warn").length;

	return (
		<div className="h-screen flex flex-col overflow-hidden" style={{ background: themeColors.bg }}>
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div
					className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-30"
					style={{ background: `radial-gradient(circle, ${themeColors.accent}20 0%, transparent 70%)`, filter: "blur(60px)" }}
				/>
				<div
					className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
					style={{ background: `radial-gradient(circle, ${themeColors.accent}15 0%, transparent 70%)`, filter: "blur(80px)" }}
				/>
			</div>
			<Toolbar
				theme={theme}
				mode={mode}
				isRunning={isRunning}
				isSharing={isSharing}
				onRun={runCode}
				onReset={handleReset}
				onDownload={handleDownload}
				onShare={handleShare}
				onThemeChange={setTheme}
				onModeChange={setMode}
			/>
			{shareStatus ? (
				<div className="px-4 py-2 text-xs border-b" style={{ color: themeColors.textMuted, borderColor: themeColors.border }}>
					{shareStatus}
				</div>
			) : null}
			<div className="flex-1 flex overflow-hidden relative">
				<CodeEditor code={code} theme={theme} onChange={setCode} onRun={runCode} />
				<OutputPanel
					activeTab={activeTab}
					code={code}
					messages={messages}
					executionTime={executionTime}
					errorCount={errorCount}
					warnCount={warnCount}
					onClear={() => setMessages([])}
					onTabChange={setActiveTab}
					themeColors={themeColors}
				/>
			</div>
		</div>
	);
}
