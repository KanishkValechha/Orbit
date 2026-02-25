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

function generateConsoleScript(execId: string): string {
	return `
    (function() {
      const __execId = "${execId}";
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
          },
          execId: __execId
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
          },
          execId: __execId
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
		const execId = crypto.randomUUID();
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
			if (event.data?.execId !== execId) return;

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
          <script>${generateConsoleScript(execId)}</script>
        </head>
        <body>
          <script>
            (function() {
              const __execId = "${execId}";
              const __OriginalPromise = Promise;
              const __originalThen = __OriginalPromise.prototype.then;
              const __pending = { count: 0 };
              
              function __trackPromise(promise) {
                if (promise && typeof promise.then === 'function') {
                  __pending.count++;
                  __originalThen.call(promise,
                    () => __pending.count--,
                    () => __pending.count--
                  );
                }
                return promise;
              }
              
              Promise = function(executor) {
                return __trackPromise(new __OriginalPromise(executor));
              };
              Promise.resolve = (v) => __trackPromise(__OriginalPromise.resolve(v));
              Promise.reject = (v) => __trackPromise(__OriginalPromise.reject(v));
              Promise.all = (arr) => __trackPromise(__OriginalPromise.all(arr));
              Promise.race = (arr) => __trackPromise(__OriginalPromise.race(arr));
              Promise.allSettled = (arr) => __trackPromise(__OriginalPromise.allSettled(arr));
              Promise.any = (arr) => __trackPromise(__OriginalPromise.any(arr));
              Promise.prototype = __OriginalPromise.prototype;
              
              __OriginalPromise.prototype.then = function(onFulfilled, onRejected) {
                return __trackPromise(__originalThen.call(this, onFulfilled, onRejected));
              };
              
              async function __drain() {
                while (__pending.count > 0) {
                  await new __OriginalPromise(r => setTimeout(r, 10));
                }
              }
              
              function __send(type, payload) {
                window.parent.postMessage({ type, payload, execId: __execId }, '*');
              }
              
              (async function() {
                try {
                  const __result = (function() {
                    ${code}
                  })();
                  if (__result && typeof __result.then === 'function') {
                    __trackPromise(__result);
                  }
                  await __drain();
                  __send('result', undefined);
                } catch (__e) {
                  __send('error', {
                    name: __e.name,
                    message: __e.message,
                    stack: __e.stack
                  });
                }
              })();
            })();
          </script>
        </body>
      </html>
    `;

		iframe.srcdoc = html;
	});
}
