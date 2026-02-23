import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

interface PreviewFrameProps {
	code: string;
	className?: string;
	onConsole?: (type: string, args: unknown[]) => void;
}

export function PreviewFrame({
	code,
	className,
	onConsole,
}: PreviewFrameProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [key, setKey] = useState(0);

	const generatePreviewHtml = useCallback((jsCode: string): string => {
		return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      color: #e5e5e5;
      min-height: 100vh;
      padding: 20px;
    }
    #root { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    (function() {
      function sendToParent(type, args) {
        const serializedArgs = args.map(arg => {
          if (arg === null) return 'null';
          if (arg === undefined) return 'undefined';
          if (typeof arg === 'function') return arg.toString();
          if (typeof arg === 'symbol') return arg.toString();
          if (arg instanceof Error) return { name: arg.name, message: arg.message, stack: arg.stack };
          if (arg instanceof Map) return { __type: 'Map', data: Array.from(arg.entries()) };
          if (arg instanceof Set) return { __type: 'Set', data: Array.from(arg.values()) };
          if (arg instanceof Date) return { __type: 'Date', data: arg.toISOString() };
          if (arg instanceof RegExp) return { __type: 'RegExp', data: arg.toString() };
          if (Array.isArray(arg)) return arg.map(a => sendToParent('serialize', [a])[0]);
          if (typeof arg === 'object') {
            try {
              return JSON.parse(JSON.stringify(arg));
            } catch {
              return String(arg);
            }
          }
          return arg;
        });
        
        window.parent.postMessage({
          type: 'console',
          payload: { type, args: serializedArgs, timestamp: Date.now() }
        }, '*');
        
        return serializedArgs;
      }

      const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info
      };

      console.log = (...args) => { sendToParent('log', args); originalConsole.log.apply(console, args); };
      console.warn = (...args) => { sendToParent('warn', args); originalConsole.warn.apply(console, args); };
      console.error = (...args) => { sendToParent('error', args); originalConsole.error.apply(console, args); };
      console.info = (...args) => { sendToParent('info', args); originalConsole.info.apply(console, args); };

      window.onerror = (message, source, lineno, colno, error) => {
        sendToParent('error', [{ name: error?.name || 'Error', message: String(message), stack: error?.stack }]);
      };

      try {
        ${jsCode}
      } catch(e) {
        console.error(e);
      }
    })();
  </script>
</body>
</html>
    `.trim();
	}, []);

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			if (event.data?.type === "console") {
				onConsole?.(event.data.payload.type, event.data.payload.args);
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [onConsole]);

	useEffect(() => {
		if (iframeRef.current && code) {
			const html = generatePreviewHtml(code);
			iframeRef.current.srcdoc = html;
		}
	}, [code, generatePreviewHtml]);

	const refresh = useCallback(() => {
		setKey((k) => k + 1);
	}, []);

	return (
		<div className={cn("relative h-full", className)}>
			<iframe
				ref={iframeRef}
				key={key}
				sandbox="allow-scripts"
				className="w-full h-full border-0 bg-black"
				title="Preview"
			/>
			<button
				type="button"
				onClick={refresh}
				className="absolute top-2 right-2 p-1.5 rounded bg-black/50 hover:bg-black/70 text-gray-400 hover:text-white transition-colors"
				title="Refresh preview"
				aria-label="Refresh preview"
			>
				<svg
					className="w-4 h-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
			</button>
		</div>
	);
}
