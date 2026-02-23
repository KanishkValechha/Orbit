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

export function transpileTypeScript(code: string): string {
	let result = code;

	const stringPlaceholders: string[] = [];
	let placeholderIndex = 0;

	result = result.replace(/(["'`])(?:(?!\1|\\).|\\.)*\1/g, (match) => {
		stringPlaceholders.push(match);
		return `__STRING_${placeholderIndex++}__`;
	});

	result = result.replace(/\/\/[^\n]*/g, "");
	result = result.replace(/\/\*[\s\S]*?\*\//g, "");

	result = result.replace(
		/:\s*(?:string|number|boolean|any|void|never|unknown|object|bigint|symbol|null|undefined|never)(?:\s*[),={;\n\r])/gi,
		(match) => {
			return match.charAt(match.length - 1);
		},
	);

	result = result.replace(
		/:\s*(?:string|number|boolean|any|void|never|unknown|object|bigint|symbol|null|undefined|never)\s*\[\s*\]/gi,
		"",
	);

	result = result.replace(/:\s*Array<[^>]+>/gi, "");
	result = result.replace(/:\s*Map<[^>]+>/gi, "");
	result = result.replace(/:\s*Set<[^>]+>/gi, "");
	result = result.replace(/:\s*Record<[^>]+>/gi, "");
	result = result.replace(/:\s*\{[^}]*\}/g, "");

	result = result.replace(/\.\.\.(?=\s*\w)/g, "");

	result = result.replace(/<\s*\w+\s*>/g, "");
	result = result.replace(/<\s*\w+\s*,\s*\w+\s*>/g, "");

	result = result.replace(/\binterface\s+\w+\s*(?:<[^>]+>)?\s*\{[^}]*\}/g, "");
	result = result.replace(/\btype\s+\w+\s*(?:<[^>]+>)?\s*=\s*[^;]+;/g, "");

	result = result.replace(
		/\bas\s+(?:\w+(?:\[\])?(?:\s*\|\s*\w+(?:\[\])?)*)/g,
		"",
	);

	result = result.replace(/\benum\s+\w+\s*\{[^}]*\}/g, "");

	result = result.replace(/\bprivate\s+(?=\w)/g, "");
	result = result.replace(/\bpublic\s+(?=\w)/g, "");
	result = result.replace(/\bprotected\s+(?=\w)/g, "");
	result = result.replace(/\breadonly\s+(?=\w)/g, "");
	result = result.replace(/\babstract\s+(?=\w)/g, "");

	result = result.replace(/\bimplements\s+\w+(?:\s*,\s*\w+)*/g, "");
	result = result.replace(/\bextends\s+\w+(?:<[^>]+>)?/g, (match) => {
		if (match.includes("extends")) {
			return "";
		}
		return match;
	});

	result = result.replace(/\bnamespace\s+\w+\s*\{[\s\S]*?\}/g, "");
	result = result.replace(/\bdeclare\s+\w+\s+\w+[^;]*;/g, "");

	result = result.replace(/\bkeyof\s+/g, "");
	result = result.replace(/\btypeof\s+/g, "");
	result = result.replace(/\binfer\s+\w+/g, "");

	result = result.replace(/\bfunction\s+(\w+)\s*</g, "function $1(");
	result = result.replace(/\bconst\s+(\w+)\s*</g, "const $1");

	for (let i = 0; i < stringPlaceholders.length; i++) {
		result = result.replace(`__STRING_${i}__`, stringPlaceholders[i]);
	}

	result = result.replace(/\n\s*\n\s*\n/g, "\n\n");
	result = result.trim();

	return result;
}

function createSandboxIframe(): HTMLIFrameElement {
	const existing = document.getElementById(IFRAME_ID);
	if (existing) {
		existing.remove();
	}

	const iframe = document.createElement("iframe");
	iframe.id = IFRAME_ID;
	iframe.style.display = "none";
	iframe.style.width = "0";
	iframe.style.height = "0";
	iframe.style.border = "none";
	iframe.setAttribute("sandbox", "allow-scripts");
	document.body.appendChild(iframe);

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
					success: true,
					executionTime: performance.now() - startTime,
					console: messages,
				});
			}
		}, 30000);

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
					setTimeout(() => {
						cleanup();
						resolve({
							success: true,
							result: event.data.payload,
							executionTime: performance.now() - startTime,
							console: messages,
						});
					}, 100);
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
            (async function() {
              try {
                await (async function() {
                  ${code}
                })();
                await new Promise(r => setTimeout(r, 5000));
                window.parent.postMessage({
                  type: 'result',
                  payload: undefined
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
            })();
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
