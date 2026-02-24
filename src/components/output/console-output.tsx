import { AlertCircle, AlertTriangle, Info, Sparkles, Terminal } from "lucide-react";
import type { ThemeInfo } from "#/lib/themes/theme-data";
import type { ConsoleMessage } from "#/lib/sandbox/types";

interface ConsoleOutputProps {
	messages: ConsoleMessage[];
	executionTime: number | null;
	errorCount: number;
	warnCount: number;
	onClear: () => void;
	themeColors: ThemeInfo["colors"];
}

export function ConsoleOutput({
	messages,
	executionTime,
	errorCount,
	warnCount,
	onClear,
	themeColors,
}: ConsoleOutputProps) {
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
				<p className="text-xs mt-1 opacity-60">Press ⌘⇧ Enter to run code</p>
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
								className="w-4 h-4 shrink-0 mt-0.5"
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
