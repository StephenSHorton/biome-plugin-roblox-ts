import { describe, test, expect } from "bun:test";
import { readdirSync, existsSync } from "fs";
import { join } from "path";

const PROJECT_ROOT = join(import.meta.dir, "..");
const INVALID_DIR = join(import.meta.dir, "invalid");
const VALID_DIR = join(import.meta.dir, "valid");
const BIOME_BIN = join(
	PROJECT_ROOT,
	"node_modules",
	".bin",
	process.platform === "win32" ? "biome.cmd" : "biome",
);

// Rules that cannot be implemented in GritQL because they require TypeScript
// type information (which GritQL has no access to). These are kept as placeholders.
const KNOWN_BROKEN_RULES = new Set<string>([]);

interface Diagnostic {
	severity: string;
	message: string;
	category: string;
	location: {
		path: string;
		start: { line: number; column: number };
		end: { line: number; column: number };
	};
	advices: unknown[];
}

interface LintResult {
	summary: Record<string, number>;
	diagnostics: Diagnostic[];
	command: string;
}

function lint(filePath: string): Diagnostic[] {
	const result = Bun.spawnSync(
		[
			BIOME_BIN,
			"lint",
			"--reporter=json",
			"--max-diagnostics=none",
			"--config-path",
			PROJECT_ROOT,
			filePath,
		],
		{ cwd: PROJECT_ROOT },
	);

	const stdout = result.stdout.toString();
	const stderr = result.stderr.toString();
	const combined = stdout + stderr;
	const jsonLine = combined.split("\n").find((l) => l.trim().startsWith("{"));
	if (!jsonLine) return [];

	// Biome's JSON reporter on Windows emits unescaped backslashes inside
	// path strings (e.g. "tests\invalid\foo.ts"), which breaks JSON.parse.
	// Escape any backslash that isn't already a valid JSON escape.
	const sanitized = jsonLine.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");

	try {
		const output: LintResult = JSON.parse(sanitized);
		return output.diagnostics ?? [];
	} catch {
		return [];
	}
}

function pluginDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
	return diagnostics.filter((d) => d.category === "plugin");
}

// Discover test fixtures
const invalidFiles = existsSync(INVALID_DIR)
	? readdirSync(INVALID_DIR).filter((f) => f.endsWith(".ts"))
	: [];
const validFiles = existsSync(VALID_DIR)
	? readdirSync(VALID_DIR).filter((f) => f.endsWith(".ts"))
	: [];

describe("invalid fixtures trigger plugin diagnostics", () => {
	for (const file of invalidFiles) {
		const ruleName = file.replace(".ts", "");

		if (KNOWN_BROKEN_RULES.has(ruleName)) {
			test.skip(`${ruleName} (blocked by Biome plugin limitation)`, () => {});
			continue;
		}

		test(ruleName, () => {
			const diagnostics = lint(join(INVALID_DIR, file));
			const pluginDiags = pluginDiagnostics(diagnostics);
			expect(pluginDiags.length).toBeGreaterThan(0);
		});
	}
});

describe("valid fixtures produce no plugin diagnostics", () => {
	for (const file of validFiles) {
		const ruleName = file.replace(".ts", "");

		if (KNOWN_BROKEN_RULES.has(ruleName)) {
			test.skip(`${ruleName} (blocked by Biome plugin limitation)`, () => {});
			continue;
		}

		test(ruleName, () => {
			const diagnostics = lint(join(VALID_DIR, file));
			const pluginDiags = pluginDiagnostics(diagnostics);
			expect(pluginDiags).toEqual([]);
		});
	}
});
