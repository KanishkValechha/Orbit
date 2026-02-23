import { AlertCircle, AlertTriangle, Info, Terminal } from "lucide-react";
import type { ConsoleMessage } from "../../lib/sandbox";
import { cn } from "../../lib/utils";
import { Badge } from "../ui";

interface ConsoleOutputProps {
	messages: ConsoleMessage[];
	className?: string;
}

const typeConfig = {
	log: {
		icon: Terminal,
		color: "text-gray-300",
		bg: "bg-transparent",
	},
	info: {
		icon: Info,
		color: "text-cyan-400",
		bg: "bg-cyan-500/5",
	},
	warn: {
		icon: AlertTriangle,
		color: "text-amber-400",
		bg: "bg-amber-500/5",
	},
	error: {
		icon: AlertCircle,
		color: "text-red-400",
		bg: "bg-red-500/5",
	},
	result: {
		icon: Terminal,
		color: "text-emerald-400",
		bg: "bg-emerald-500/5",
	},
};

function formatValue(value: unknown): string {
	if (value === null) return "null";
	if (value === undefined) return "undefined";
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean")
		return String(value);
	if (typeof value === "function") return value.toString();

	if (typeof value === "object") {
		const obj = value as Record<string, unknown>;
		if (obj.__type === "Map") {
			return `Map(${(obj.data as unknown[]).length}) { ${(
				obj.data as [unknown, unknown][]
			)
				.map(([k, v]) => `${formatValue(k)} => ${formatValue(v)}`)
				.join(", ")} }`;
		}
		if (obj.__type === "Set") {
			return `Set(${(obj.data as unknown[]).length}) { ${(obj.data as unknown[])
				.map(formatValue)
				.join(", ")} }`;
		}
		if (obj.__type === "Date") {
			return `Date("${obj.data}")`;
		}
		if (obj.__type === "RegExp") {
			return String(obj.data);
		}
		if (obj.name && obj.message && "stack" in obj) {
			return `${obj.name}: ${obj.message}`;
		}
		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return String(value);
		}
	}

	return String(value);
}

export function ConsoleOutput({ messages, className }: ConsoleOutputProps) {
	if (messages.length === 0) {
		return (
			<div
				className={cn(
					"flex items-center justify-center h-full text-gray-500",
					className,
				)}
			>
				<div className="text-center">
					<Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
					<p className="text-sm">Console output will appear here</p>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("overflow-auto font-mono text-sm", className)}>
			{messages.map((msg) => {
				const config = typeConfig[msg.type];
				const Icon = config.icon;

				return (
					<div
						key={msg.id}
						className={cn(
							"flex gap-3 px-4 py-2 border-b border-white/5",
							config.bg,
						)}
					>
						<Icon
							className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.color)}
						/>
						<div className="flex-1 min-w-0">
							<div
								className={cn("whitespace-pre-wrap break-all", config.color)}
							>
								{msg.args.map((arg: unknown, i: number) => (
									<span key={`${msg.id}-${i}`}>
										{i > 0 && " "}
										{formatValue(arg)}
									</span>
								))}
							</div>
						</div>
						<span className="text-xs text-gray-500 flex-shrink-0">
							{new Date(msg.timestamp).toLocaleTimeString()}
						</span>
					</div>
				);
			})}
		</div>
	);
}

interface ConsoleHeaderProps {
	messageCount: number;
	errorCount: number;
	warnCount: number;
	onClear: () => void;
}

export function ConsoleHeader({
	messageCount,
	errorCount,
	warnCount,
	onClear,
}: ConsoleHeaderProps) {
	return (
		<div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
			<div className="flex items-center gap-3">
				<span className="text-sm font-medium text-gray-300">Console</span>
				<div className="flex items-center gap-1.5">
					{errorCount > 0 && <Badge variant="error">{errorCount}</Badge>}
					{warnCount > 0 && <Badge variant="warning">{warnCount}</Badge>}
					{messageCount > 0 && <Badge variant="default">{messageCount}</Badge>}
				</div>
			</div>
			<button
				type="button"
				onClick={onClear}
				className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
			>
				Clear
			</button>
		</div>
	);
}
