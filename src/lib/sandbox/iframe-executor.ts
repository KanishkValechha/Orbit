import type { ConsoleMessage, ExecutionResult } from "./types";

const IFRAME_ID = "orbit-sandbox-iframe";

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
