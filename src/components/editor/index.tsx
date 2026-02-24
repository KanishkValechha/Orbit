import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { useCallback, useRef } from "react";
import type { ThemeInfo, ThemeName } from "#/lib/themes/theme-data";
import { registerMonacoThemes } from "#/lib/themes/monaco-themes";

interface CodeEditorProps {
	code: string;
	theme: ThemeName;
	themeColors: ThemeInfo["colors"];
	onChange: (code: string) => void;
}

export function CodeEditor({
	code,
	theme,
	themeColors,
	onChange,
}: CodeEditorProps) {
	const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

	const handleBeforeMount: BeforeMount = useCallback((monaco) => {
		registerMonacoThemes(monaco);
		monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			module: monaco.languages.typescript.ModuleKind.ESNext,
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			allowNonTsExtensions: true,
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
			strict: true,
			jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
			lib: ["esnext", "dom", "dom.iterable"],
		});
	}, []);

	const handleMount: OnMount = useCallback((editor) => {
		editorRef.current = editor;
		editor.getModel()?.updateOptions({ tabSize: 2 });
	}, []);

	return (
		<Editor
			height="100%"
			language="typescript"
			value={code}
			theme={theme}
			onChange={(v) => onChange(v ?? "")}
			beforeMount={handleBeforeMount}
			onMount={handleMount}
			loading={
				<div
					className="flex items-center justify-center h-full"
					style={{ background: themeColors.bg }}
				>
					<div
						className="flex items-center gap-3"
						style={{ color: themeColors.textMuted }}
					>
						<div
							className="w-4 h-4 border-2 rounded-full animate-spin"
							style={{
								borderColor: `${themeColors.accent}40`,
								borderTopColor: themeColors.accent,
							}}
						/>
						<span className="text-sm">Loading editor...</span>
					</div>
				</div>
			}
			options={{
				lineNumbers: "on",
				minimap: { enabled: false },
				wordWrap: "on",
				fontSize: 14,
				fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
				fontLigatures: true,
				scrollBeyondLastLine: false,
				smoothScrolling: true,
				cursorBlinking: "smooth",
				cursorSmoothCaretAnimation: "on",
				padding: { top: 16, bottom: 16 },
				renderLineHighlight: "all",
				bracketPairColorization: { enabled: true },
				guides: { bracketPairs: true, indentation: true },
				automaticLayout: true,
				fixedOverflowWidgets: true,
				overviewRulerBorder: false,
				hideCursorInOverviewRuler: true,
				scrollbar: {
					vertical: "auto",
					horizontal: "auto",
					verticalScrollbarSize: 8,
					horizontalScrollbarSize: 8,
				},
			}}
		/>
	);
}
