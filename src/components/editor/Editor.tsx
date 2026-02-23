import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import { registerMonacoThemes, type ThemeName } from "../../lib/themes";
import { cn } from "../../lib/utils";

interface CodeEditorProps {
	value: string;
	onChange?: (value: string) => void;
	language?: string;
	theme?: ThemeName;
	className?: string;
	readOnly?: boolean;
	lineNumbers?: "on" | "off" | "relative";
	minimap?: boolean;
	wordWrap?: "on" | "off" | "bounded";
	fontSize?: number;
	onEditorMount?: (
		editor: Monaco.editor.IStandaloneCodeEditor,
		monaco: typeof Monaco,
	) => void;
}

const CodeEditor = forwardRef<
	Monaco.editor.IStandaloneCodeEditor,
	CodeEditorProps
>(
	(
		{
			value,
			onChange,
			language = "typescript",
			theme = "vercel-dark",
			className,
			readOnly = false,
			lineNumbers = "on",
			minimap = false,
			wordWrap = "on",
			fontSize = 14,
			onEditorMount,
		},
		ref,
	) => {
		const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

		const handleBeforeMount: BeforeMount = useCallback((monaco) => {
			registerMonacoThemes(monaco);

			monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.ESNext,
				module: monaco.languages.typescript.ModuleKind.ESNext,
				moduleResolution:
					monaco.languages.typescript.ModuleResolutionKind.NodeJs,
				allowNonTsExtensions: true,
				allowSyntheticDefaultImports: true,
				esModuleInterop: true,
				strict: true,
				jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
				lib: ["esnext", "dom", "dom.iterable"],
			});

			monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
				target: monaco.languages.typescript.ScriptTarget.ESNext,
				module: monaco.languages.typescript.ModuleKind.ESNext,
				moduleResolution:
					monaco.languages.typescript.ModuleResolutionKind.NodeJs,
				allowNonTsExtensions: true,
				allowSyntheticDefaultImports: true,
				esModuleInterop: true,
				jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
				lib: ["esnext", "dom", "dom.iterable"],
			});
		}, []);

		const handleMount: OnMount = useCallback(
			(editor, monaco) => {
				editorRef.current = editor;
				if (ref) {
					if (typeof ref === "function") {
						ref(editor);
					} else {
						ref.current = editor;
					}
				}

				editor.getModel()?.updateOptions({ tabSize: 2 });

				onEditorMount?.(editor, monaco);
			},
			[onEditorMount, ref],
		);

		const handleChange = useCallback(
			(value: string | undefined) => {
				onChange?.(value ?? "");
			},
			[onChange],
		);

		useEffect(() => {
			return () => {
				editorRef.current?.dispose();
			};
		}, []);

		return (
			<div className={cn("h-full w-full overflow-hidden", className)}>
				<Editor
					height="100%"
					language={language}
					value={value}
					theme={theme}
					onChange={handleChange}
					beforeMount={handleBeforeMount}
					onMount={handleMount}
					loading={
						<div className="flex items-center justify-center h-full bg-black/40">
							<div className="flex items-center gap-3 text-gray-400">
								<div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
								<span className="text-sm">Loading editor...</span>
							</div>
						</div>
					}
					options={{
						readOnly,
						lineNumbers,
						minimap: { enabled: minimap },
						wordWrap,
						fontSize,
						fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
						fontLigatures: true,
						scrollBeyondLastLine: false,
						smoothScrolling: true,
						cursorBlinking: "smooth",
						cursorSmoothCaretAnimation: "on",
						padding: { top: 16, bottom: 16 },
						renderLineHighlight: "all",
						bracketPairColorization: { enabled: true },
						guides: {
							bracketPairs: true,
							indentation: true,
						},
						automaticLayout: true,
						fixedOverflowWidgets: true,
						overviewRulerBorder: false,
						hideCursorInOverviewRuler: true,
						scrollbar: {
							vertical: "auto",
							horizontal: "auto",
							verticalScrollbarSize: 10,
							horizontalScrollbarSize: 10,
						},
					}}
				/>
			</div>
		);
	},
);

CodeEditor.displayName = "CodeEditor";

export { CodeEditor };
