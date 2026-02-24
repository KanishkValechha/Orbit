import { useRef } from "react";
import type { ThemeInfo } from "#/lib/themes/theme-data";

interface PreviewFrameProps {
	code: string;
	themeColors: ThemeInfo["colors"];
}

export function PreviewFrame({ code, themeColors }: PreviewFrameProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
      color: #e5e5e5;
      min-height: 100vh;
      padding: 24px;
    }
    #root { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    try { ${code} } catch(e) { console.error(e); }
  </script>
</body>
</html>
  `;

	return (
		<iframe
			ref={iframeRef}
			srcDoc={html}
			sandbox="allow-scripts"
			className="w-full h-full border-0"
			style={{ background: themeColors.bg }}
			title="Preview"
		/>
	);
}
