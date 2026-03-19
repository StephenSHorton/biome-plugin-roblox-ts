# CLAUDE.md

## Project Overview

Biome linter plugin for roblox-ts projects. Port of [eslint-plugin-roblox-ts](https://github.com/roblox-ts/eslint-plugin-roblox-ts) to Biome using GritQL rules.

## Architecture

- `biome.json` - Plugin configuration that consumers extend via `biome-plugin-roblox-ts/biome`
- `rules/*.grit` - Individual GritQL rule files, one per lint rule
- `tests/` - Bun test suite with invalid/valid fixtures per rule
- Published as an npm package; consumers add it as a dev dependency and extend the config

## GritQL Rule Conventions

All rules follow this pattern:

```grit
language js;

`pattern_to_match` where {
    register_diagnostic(
        span = $match,
        message = "Human-readable error message."
    )
}
```

- Every rule file starts with `language js;`
- Use `register_diagnostic()` with `span` and `message` (optionally `severity`)
- Default severity is `error`; use `severity = "warn"` for less critical rules
- GritQL has no autofix support — rules can only report diagnostics
- GritQL cannot access TypeScript type information — type-dependent rules are placeholders

### Workaround: `if_statement()` node type

Code patterns like `` `if ("")` `` do not fire as plugins, but using the tree-sitter node type name `if_statement($condition, $consequence)` DOES work. Use this pattern with `$condition <: ` matching for if-statement rules.

### Biome Plugin Node Type Limitation

Biome's plugin system only visits a subset of AST node types. Patterns that resolve to these nodes work:
- Expressions: binary, unary, typeof, member access, call expressions
- Literals: null, string, number, regex, identifiers
- Some statements: if_statement, return_statement, variable_declaration

Patterns for these node types DO NOT fire as plugins (verified via testing):
- Declarations: enum, namespace, class, function, interface
- Statements: for-in, for-of, for, while, switch, labeled, with, try
- Class members: getters, setters, method definitions, private identifiers
- Type annotations

Rules with `// LIMITATION:` comments in their source are affected. They match in `biome search` but not in `biome lint` plugins. They're kept so they auto-activate when Biome adds support.

## ESLint Plugin Reference

The original ESLint plugin at `~/Desktop/eslint-plugin-roblox-ts` (or on GitHub) is the source of truth for rule behavior. When porting or updating rules, compare against the ESLint implementation.

## Testing

Run the test suite:

```bash
bun test
```

Tests use fixture files in `tests/invalid/` (should trigger diagnostics) and `tests/valid/` (should not). Rules blocked by Biome limitations are in the `KNOWN_BROKEN_RULES` set in `tests/rules.test.ts` and are automatically skipped.

To test against a real roblox-ts project:

1. Link the plugin locally: `npm link` (from this directory)
2. In the test project: `npm link biome-plugin-roblox-ts`
3. Add `"extends": ["biome-plugin-roblox-ts/biome"]` to the test project's `biome.json`
4. Run: `npx @biomejs/biome lint .`

The `~/Desktop/roblox-moba` project can be used for integration testing.

To test a GritQL pattern directly without the plugin system:

```bash
npx @biomejs/biome search '`your_pattern`' ./path/to/file.ts
```

## Publishing

The package is published to npm as `biome-plugin-roblox-ts`. The `files` field in `package.json` includes only `rules/` and `biome.json`. Version bumps and releases are handled by the GitHub Actions workflow in `.github/workflows/release.yml`.

## Key Limitations

- **Plugin node types**: Only expression-level AST nodes are visited by Biome's plugin system. 8 rules are blocked. GritQL is the only third-party plugin mechanism — there is no WASM/JS/Rust plugin API for external authors. Native Rust rules (merged into Biome's repo) are the only alternative for full AST access.
- **No autofix**: GritQL plugins can only report diagnostics, not fix code.
- **No TypeScript types**: GritQL cannot access type information. 3 rules are placeholders.
- Rules with `false` in their `where` clause or `// LIMITATION:` comments are intentionally non-functional.

## Future: Native Rust Rules

The 8 rules blocked by plugin node type limitations and the 3 type-dependent rules could potentially be contributed as native Rust rules upstream to the Biome project. This would give them full AST access and type information. This is a separate effort from the GritQL plugin and would involve writing Rust, going through Biome's contribution process, and maintaining rules in their repository.
