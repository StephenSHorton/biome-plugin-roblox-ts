import { describe, test, expect } from "bun:test";
import { readdirSync, existsSync } from "fs";
import { join } from "path";

const PROJECT_ROOT = join(import.meta.dir, "..");
const INVALID_DIR = join(import.meta.dir, "invalid");
const VALID_DIR = join(import.meta.dir, "valid");

// Rules that don't fire due to Biome plugin node type limitations.
// These patterns match in `biome search` but the plugin system doesn't
// visit these AST node types. Keep the rules for when Biome adds support.
const KNOWN_BROKEN_RULES = new Set([
	"noEnumMerging",
	"noGettersOrSetters",
	"noSetters",
	"noNamespaceMerging",
	"noLabels",
	"noForIn",
	"noImplicitSelf",
	"noPrivateIdentifier",
]);

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
			"npx",
			"@biomejs/biome",
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

	try {
		const output: LintResult = JSON.parse(jsonLine);
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
