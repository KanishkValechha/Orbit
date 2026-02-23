import { Code, Layout, Play } from "lucide-react";
import { useCallback, useState } from "react";
import {
	type ConsoleMessage,
	type ExecutionMode,
	executeCode,
} from "../../lib/sandbox";
import { cn } from "../../lib/utils";
import { Button, Panel, PanelHeader, PanelTitle } from "../ui";
import { ConsoleHeader, ConsoleOutput } from "./ConsoleOutput";
import { PreviewFrame } from "./PreviewFrame";

interface OutputPanelProps {
	code: string;
	className?: string;
}

type Tab = "console" | "preview";

export function OutputPanel({ code, className }: OutputPanelProps) {
	const [activeTab, setActiveTab] = useState<Tab>("console");
	const [messages, setMessages] = useState<ConsoleMessage[]>([]);
	const [isRunning, setIsRunning] = useState(false);
	const [executionTime, setExecutionTime] = useState<number | null>(null);
	const [mode, setMode] = useState<ExecutionMode>("iframe");

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

	const clearConsole = useCallback(() => {
		setMessages([]);
		setExecutionTime(null);
	}, []);

	const errorCount = messages.filter((m) => m.type === "error").length;
	const warnCount = messages.filter((m) => m.type === "warn").length;

	return (
		<Panel variant="elevated" className={cn("flex flex-col h-full", className)}>
			<PanelHeader className="flex-row justify-between items-center">
				<div className="flex items-center gap-3">
					<PanelTitle>Output</PanelTitle>
					{executionTime !== null && (
						<span className="text-xs text-gray-500 font-mono">
							{executionTime.toFixed(2)}ms
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<select
						value={mode}
						onChange={(e) => setMode(e.target.value as ExecutionMode)}
						className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-gray-300"
					>
						<option value="iframe">iframe</option>
						<option value="worker">Worker</option>
					</select>
					<Button
						variant="primary"
						size="sm"
						onClick={runCode}
						disabled={isRunning}
						className="gap-1.5"
					>
						<Play className="w-3.5 h-3.5" />
						{isRunning ? "Running..." : "Run"}
					</Button>
				</div>
			</PanelHeader>

			<div className="flex border-b border-white/5">
				<button
					type="button"
					onClick={() => setActiveTab("console")}
					className={cn(
						"flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
						activeTab === "console"
							? "text-white border-b-2 border-cyan-400"
							: "text-gray-400 hover:text-gray-200",
					)}
				>
					<Code className="w-4 h-4" />
					Console
					{messages.length > 0 && (
						<span className="px-1.5 py-0.5 text-xs rounded bg-white/10">
							{messages.length}
						</span>
					)}
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("preview")}
					className={cn(
						"flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
						activeTab === "preview"
							? "text-white border-b-2 border-cyan-400"
							: "text-gray-400 hover:text-gray-200",
					)}
				>
					<Layout className="w-4 h-4" />
					Preview
				</button>
			</div>

			<div className="flex-1 overflow-hidden">
				{activeTab === "console" ? (
					<>
						<ConsoleHeader
							messageCount={messages.length}
							errorCount={errorCount}
							warnCount={warnCount}
							onClear={clearConsole}
						/>
						<ConsoleOutput
							messages={messages}
							className="h-[calc(100%-41px)]"
						/>
					</>
				) : (
					<PreviewFrame code={code} className="h-full" />
				)}
			</div>
		</Panel>
	);
}
