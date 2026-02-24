import {
	AlertCircle,
	AlertTriangle,
	ArrowBigUp,
	ChevronRight,
	Command,
	CornerDownLeft,
	Info,
	Sparkles,
	Terminal,
	Trash2,
} from "lucide-react";
import { Kbd, KbdGroup } from "#/components/ui/kbd";
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

const typeConfig = {
	log: { icon: ChevronRight, label: "log" },
	info: { icon: Info, label: "info", color: "#38bdf8" },
	warn: { icon: AlertTriangle, label: "warn", color: "#facc15" },
	error: { icon: AlertCircle, label: "error", color: "#f87171" },
	result: { icon: Sparkles, label: "result", color: "#34d399" },
};

export function ConsoleOutput({
	messages,
	executionTime,
	errorCount,
	warnCount,
	onClear,
	themeColors,
}: ConsoleOutputProps) {
	if (messages.length === 0) {
		return (
			<div
				className="flex flex-col items-center justify-center h-full gap-3 px-8"
				style={{ color: themeColors.textMuted }}
			>
				<div
					className="w-12 h-12 rounded-xl flex items-center justify-center"
					style={{
						background: `${themeColors.bgTertiary}`,
						border: `1px solid ${themeColors.border}`,
					}}
				>
					<Terminal className="w-5 h-5 opacity-50" />
				</div>
				<div className="text-center">
					<p className="text-xs font-medium" style={{ color: themeColors.textMuted }}>
						No output yet
					</p>
					<p className="text-[11px] mt-1 opacity-50">
						Run your code to see console output
					</p>
				</div>
				<KbdGroup
					className="inline-flex mt-1 px-2 py-1"
					style={{
						background: themeColors.bgTertiary,
						color: themeColors.textMuted,
						border: `1px solid ${themeColors.border}`,
						borderRadius: "6px",
					}}
				>
					<Kbd style={{ background: "transparent", border: "none", padding: 0 }}>
						<Command className="size-3" />
					</Kbd>
					<Kbd style={{ background: "transparent", border: "none", padding: 0 }}>
						<ArrowBigUp className="size-3" />
					</Kbd>
					<Kbd style={{ background: "transparent", border: "none", padding: 0 }}>
						<CornerDownLeft className="size-3" />
					</Kbd>
				</KbdGroup>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col">
			{/* Stats bar */}
			<div
				className="flex items-center justify-between px-3 h-8 shrink-0"
				style={{
					borderBottom: `1px solid ${themeColors.border}50`,
					background: `${themeColors.bgSecondary}80`,
				}}
			>
				<div className="flex items-center gap-2">
					{executionTime !== null && (
						<span
							className="flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded"
							style={{
								background: `${themeColors.accent}10`,
								color: themeColors.textMuted,
							}}
						>
							{executionTime.toFixed(1)}ms
						</span>
					)}
					{errorCount > 0 && (
						<span
							className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
							style={{
								background: "rgba(248, 113, 113, 0.1)",
								color: "#f87171",
							}}
						>
							{errorCount} error{errorCount > 1 ? "s" : ""}
						</span>
					)}
					{warnCount > 0 && (
						<span
							className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
							style={{
								background: "rgba(250, 204, 21, 0.1)",
								color: "#facc15",
							}}
						>
							{warnCount} warn{warnCount > 1 ? "s" : ""}
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={onClear}
					className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors duration-150 cursor-pointer"
					style={{ color: themeColors.textMuted }}
					title="Clear console"
				>
					<Trash2 className="w-3 h-3" />
					Clear
				</button>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-auto">
				{messages.map((msg, index) => {
					const config = typeConfig[msg.type];
					const Icon = config.icon;
					const color =
						"color" in config ? config.color : themeColors.textMuted;

					return (
						<div
							key={msg.id}
							className="flex gap-2 px-3 py-1.5 group animate-slide-in"
							style={{
								borderBottom: `1px solid ${themeColors.border}30`,
								animationDelay: `${Math.min(index * 20, 200)}ms`,
								animationFillMode: "backwards",
							}}
						>
							<Icon
								className="w-3.5 h-3.5 shrink-0 mt-0.5"
								style={{ color }}
								strokeWidth={2}
							/>
							<div className="flex-1 min-w-0">
								<pre
									className="whitespace-pre-wrap break-all text-[11px] leading-relaxed font-mono"
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
