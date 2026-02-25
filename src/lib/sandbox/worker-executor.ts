import type { ConsoleMessage, ExecutionResult } from "./types";

export async function executeInWorker(
	code: string,
	onConsole?: (message: ConsoleMessage) => void,
): Promise<ExecutionResult> {
	return new Promise((resolve) => {
		const startTime = performance.now();
		const messages: ConsoleMessage[] = [];
		const execId = crypto.randomUUID();
		let resolved = false;
		let worker: Worker | null = null;

		const timeout = setTimeout(() => {
			if (!resolved) {
				resolved = true;
				worker?.terminate();
				resolve({
					success: false,
					error: { name: "TimeoutError", message: "Execution timed out (10s)" },
					executionTime: performance.now() - startTime,
					console: messages,
				});
			}
		}, 10000);

		const workerCode = `
      self.onmessage = async (e) => {
        const { code, execId } = e.data;
        
        function sendToMain(type, args) {
          self.postMessage({ type: 'console', payload: { type, args, timestamp: Date.now() }, execId });
        }
        
        const fakeConsole = {
          log: (...args) => sendToMain('log', args),
          warn: (...args) => sendToMain('warn', args),
          error: (...args) => sendToMain('error', args),
          info: (...args) => sendToMain('info', args),
        };
        
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
        
        try {
          const fn = new Function('console', code);
          const result = fn(fakeConsole);
          if (result && typeof result.then === 'function') {
            __trackPromise(result);
          }
          await __drain();
          self.postMessage({ type: 'result', payload: undefined, execId });
        } catch (error) {
          self.postMessage({
            type: 'error',
            payload: {
              name: error.name,
              message: error.message,
              stack: error.stack
            },
            execId
          });
        }
      };
    `;

		const blob = new Blob([workerCode], { type: "application/javascript" });
		worker = new Worker(URL.createObjectURL(blob));

		worker.onmessage = (e) => {
			if (e.data.execId !== execId) return;

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
					worker?.terminate();
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
					worker?.terminate();
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
				worker?.terminate();
				resolve({
					success: false,
					error: { name: "WorkerError", message: e.message },
					executionTime: performance.now() - startTime,
					console: messages,
				});
			}
		};

		worker.postMessage({ code, execId });
	});
}
