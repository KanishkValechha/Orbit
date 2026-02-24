import type { ConsoleMessage, ExecutionResult } from "./types";

export async function executeInWorker(
	code: string,
	onConsole?: (message: ConsoleMessage) => void,
): Promise<ExecutionResult> {
	return new Promise((resolve) => {
		const startTime = performance.now();
		const messages: ConsoleMessage[] = [];
		let resolved = false;

		const timeout = setTimeout(() => {
			if (!resolved) {
				resolved = true;
				worker.terminate();
				resolve({
					success: false,
					error: { name: "TimeoutError", message: "Execution timed out (10s)" },
					executionTime: performance.now() - startTime,
					console: messages,
				});
			}
		}, 10000);

		const workerCode = `
      self.onmessage = (e) => {
        const code = e.data;
        
        const messages = [];
        
        function sendToMain(type, args) {
          self.postMessage({ type: 'console', payload: { type, args, timestamp: Date.now() } });
        }
        
        const fakeConsole = {
          log: (...args) => sendToMain('log', args),
          warn: (...args) => sendToMain('warn', args),
          error: (...args) => sendToMain('error', args),
          info: (...args) => sendToMain('info', args),
        };
        
        try {
          const fn = new Function('console', code);
          const result = fn(fakeConsole);
          self.postMessage({ type: 'result', payload: result });
        } catch (error) {
          self.postMessage({
            type: 'error',
            payload: {
              name: error.name,
              message: error.message,
              stack: error.stack
            }
          });
        }
      };
    `;

		const blob = new Blob([workerCode], { type: "application/javascript" });
		const worker = new Worker(URL.createObjectURL(blob));

		worker.onmessage = (e) => {
			if (e.data.type === "console") {
				const msg: ConsoleMessage = {
					id: crypto.randomUUID(),
					...e.data.payload,
				};
				messages.push(msg);
				onConsole?.(msg);
			} else if (e.data.type === "result") {
				if (!resolved) {
					resolved = true;
					clearTimeout(timeout);
					worker.terminate();
					resolve({
						success: true,
						result: e.data.payload,
						executionTime: performance.now() - startTime,
						console: messages,
					});
				}
			} else if (e.data.type === "error") {
				if (!resolved) {
					resolved = true;
					clearTimeout(timeout);
					worker.terminate();
					resolve({
						success: false,
						error: e.data.payload,
						executionTime: performance.now() - startTime,
						console: messages,
					});
				}
			}
		};

		worker.onerror = (e) => {
			if (!resolved) {
				resolved = true;
				clearTimeout(timeout);
				worker.terminate();
				resolve({
					success: false,
					error: { name: "WorkerError", message: e.message },
					executionTime: performance.now() - startTime,
					console: messages,
				});
			}
		};

		worker.postMessage(code);
	});
}
