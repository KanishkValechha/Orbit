import { createFileRoute } from "@tanstack/react-router";
import { Copy, Download, ExternalLink, RotateCcw, Share2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { CodeEditor, ThemeToggle, useThemeState } from "#components/editor";
import { OutputPanel } from "#components/output";
import { Badge, Panel } from "#components/ui";
import { type ThemeName, themeInfo } from "#lib/themes";

const DEFAULT_CODE = `// Shared snippet
console.log('Hello from shared snippet!')
`;

export const Route = createFileRoute("/play/$id")({
	component: PlaySnippetPage,
});

function PlaySnippetPage() {
	const { id } = Route.useParams();
	const { theme, setTheme } = useThemeState();
	const [code, setCode] = useState(DEFAULT_CODE);
	const [title, setTitle] = useState<string | null>(null);
	const [isForked, setIsForked] = useState(false);

	useEffect(() => {
		const savedSnippet = localStorage.getItem(`orbit-snippet-${id}`);
		if (savedSnippet) {
			try {
				const parsed = JSON.parse(savedSnippet);
				setCode(parsed.code || DEFAULT_CODE);
				setTitle(parsed.title || null);
			} catch {
				setCode(DEFAULT_CODE);
			}
		}
	}, [id]);

	useEffect(() => {
		if (!isForked) {
			const timer = setTimeout(() => {
				localStorage.setItem(
					`orbit-snippet-${id}`,
					JSON.stringify({ code, title }),
				);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [code, title, id, isForked]);

	const handleFork = useCallback(() => {
		setIsForked(true);
		localStorage.setItem("orbit-draft", code);
		window.location.href = "/play";
	}, [code]);

	const handleCopyLink = useCallback(() => {
		navigator.clipboard.writeText(window.location.href);
	}, []);

	const handleDownload = useCallback(() => {
		const blob = new Blob([code], { type: "text/typescript" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${title || "snippet"}.ts`;
		a.click();
		URL.revokeObjectURL(url);
	}, [code, title]);

	const themeColors = themeInfo[theme as ThemeName].colors;

	return (
		<div
			className="h-[calc(100vh-56px)] flex flex-col"
			style={{
				background: `linear-gradient(180deg, ${themeColors.bg} 0%, ${themeColors.bgSecondary} 100%)`,
			}}
		>
			<div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/20">
				<div className="flex items-center gap-3">
					<h1 className="text-sm font-medium text-gray-200">
						{title || "Shared Snippet"}
					</h1>
					<Badge variant="info">{id}</Badge>
					{isForked && <Badge variant="warning">Forked</Badge>}
				</div>
				<div className="flex items-center gap-2">
					<ThemeToggle value={theme as ThemeName} onChange={setTheme} />
					<div className="w-px h-5 bg-white/10 mx-1" />
					<button
						type="button"
						onClick={handleCopyLink}
						className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
						title="Copy link"
					>
						<Copy className="w-4 h-4" />
					</button>
					<button
						type="button"
						onClick={handleFork}
						className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
					>
						<Share2 className="w-3.5 h-3.5" />
						Fork
					</button>
					<button
						type="button"
						onClick={handleDownload}
						className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
						title="Download code"
					>
						<Download className="w-4 h-4" />
					</button>
				</div>
			</div>

			<div className="flex-1 flex overflow-hidden">
				<div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
					<Panel variant="glass" className="flex-1 rounded-none border-0">
						<CodeEditor
							value={code}
							onChange={setCode}
							language="typescript"
							theme={theme as ThemeName}
						/>
					</Panel>
				</div>

				<div className="w-[420px] flex-shrink-0 flex flex-col">
					<OutputPanel code={code} className="flex-1 rounded-none border-0" />
				</div>
			</div>
		</div>
	);
}
