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
