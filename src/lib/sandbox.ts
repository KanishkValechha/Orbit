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

const IFRAME_ID = "orbit-sandbox-iframe";

function createSandboxIframe(): HTMLIFrameElement {
	let iframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement | null;

	if (!iframe) {
		iframe = document.createElement("iframe");
		iframe.id = IFRAME_ID;
		iframe.style.display = "none";
		iframe.style.width = "0";
		iframe.style.height = "0";
		iframe.style.border = "none";
		iframe.setAttribute("sandbox", "allow-scripts");
		document.body.appendChild(iframe);
	}

	return iframe;
}

function generateConsoleScript(): string {
	return `
    (function() {
      const __messages = [];
      const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
      };

      function serializeArg(arg) {
        if (arg === null) return 'null';
        if (arg === undefined) return 'undefined';
        if (typeof arg === 'function') return arg.toString();
        if (typeof arg === 'symbol') return arg.toString();
        if (arg instanceof Error) return { name: arg.name, message: arg.message, stack: arg.stack };
        if (arg instanceof Map) return { __type: 'Map', data: Array.from(arg.entries()) };
        if (arg instanceof Set) return { __type: 'Set', data: Array.from(arg.values()) };
        if (arg instanceof Date) return { __type: 'Date', data: arg.toISOString() };
        if (arg instanceof RegExp) return { __type: 'RegExp', data: arg.toString() };
        if (Array.isArray(arg)) return arg.map(serializeArg);
        if (typeof arg === 'object') {
          try {
            return JSON.parse(JSON.stringify(arg));
          } catch {
            return String(arg);
          }
        }
        return arg;
      }

      function sendToParent(type, args) {
        const serializedArgs = args.map(serializeArg);
        window.parent.postMessage({
          type: 'console',
          payload: {
            type,
            args: serializedArgs,
            timestamp: Date.now()
          }
        }, '*');
      }

      console.log = (...args) => {
        sendToParent('log', args);
        originalConsole.log.apply(console, args);
      };
      console.warn = (...args) => {
        sendToParent('warn', args);
        originalConsole.warn.apply(console, args);
      };
      console.error = (...args) => {
        sendToParent('error', args);
        originalConsole.error.apply(console, args);
      };
      console.info = (...args) => {
        sendToParent('info', args);
        originalConsole.info.apply(console, args);
      };

      window.onerror = (message, source, lineno, colno, error) => {
        window.parent.postMessage({
          type: 'error',
          payload: {
            name: error?.name || 'Error',
            message: String(message),
            stack: error?.stack
          }
        }, '*');
      };
    })();
  `;
}

export async function executeInIframe(
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
				cleanup();
				resolve({
					success: false,
					error: { name: "TimeoutError", message: "Execution timed out (10s)" },
					executionTime: performance.now() - startTime,
					console: messages,
				});
			}
		}, 10000);

		function handleMessage(event: MessageEvent) {
			if (event.data?.type === "console") {
				const msg: ConsoleMessage = {
					id: crypto.randomUUID(),
					...event.data.payload,
				};
				messages.push(msg);
				onConsole?.(msg);
			} else if (event.data?.type === "result") {
				if (!resolved) {
					resolved = true;
					cleanup();
					resolve({
						success: true,
						result: event.data.payload,
						executionTime: performance.now() - startTime,
						console: messages,
					});
				}
			} else if (event.data?.type === "error") {
				if (!resolved) {
					resolved = true;
					cleanup();
					resolve({
						success: false,
						error: event.data.payload,
						executionTime: performance.now() - startTime,
						console: messages,
					});
				}
			}
		}

		function cleanup() {
			clearTimeout(timeout);
			window.removeEventListener("message", handleMessage);
		}

		window.addEventListener("message", handleMessage);

		const iframe = createSandboxIframe();

		const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script>${generateConsoleScript()}</script>
        </head>
        <body>
          <script>
            try {
              const __result = (function() {
                ${code}
              })();
              window.parent.postMessage({
                type: 'result',
                payload: __result
              }, '*');
            } catch (__e) {
              window.parent.postMessage({
                type: 'error',
                payload: {
                  name: __e.name,
                  message: __e.message,
                  stack: __e.stack
                }
              }, '*');
            }
          </script>
        </body>
      </html>
    `;

		iframe.srcdoc = html;
	});
}

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
      self.onmessage = function(e) {
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

export async function executeCode(
	code: string,
	mode: ExecutionMode = "iframe",
	onConsole?: (message: ConsoleMessage) => void,
): Promise<ExecutionResult> {
	if (mode === "worker") {
		return executeInWorker(code, onConsole);
	}
	return executeInIframe(code, onConsole);
}

export function transpileTypeScript(code: string): string {
	return code;
}
