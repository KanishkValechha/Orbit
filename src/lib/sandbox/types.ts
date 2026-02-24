export interface ConsoleMessage {
	id: string;
	type: "log" | "warn" | "error" | "info" | "result";
	args: unknown[];
	timestamp: number;
}

export interface ExecutionResult {
	success: boolean;
	result?: unknown;
	error?: {
		name: string;
		message: string;
		stack?: string;
	};
	executionTime: number;
	console: ConsoleMessage[];
}

export type ExecutionMode = "iframe" | "worker";
