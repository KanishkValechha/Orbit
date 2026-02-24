import { executeInIframe } from "./iframe-executor";
import { transpileTypeScript } from "./transpiler";
import type { ConsoleMessage, ExecutionMode, ExecutionResult } from "./types";
import { executeInWorker } from "./worker-executor";

export async function executeCode(
	code: string,
	mode: ExecutionMode = "iframe",
	onConsole?: (message: ConsoleMessage) => void,
): Promise<ExecutionResult> {
	const jsCode = transpileTypeScript(code);
	if (mode === "worker") {
		return executeInWorker(jsCode, onConsole);
	}
	return executeInIframe(jsCode, onConsole);
}

export type { ConsoleMessage, ExecutionMode, ExecutionResult };
export { executeInIframe, executeInWorker, transpileTypeScript };
