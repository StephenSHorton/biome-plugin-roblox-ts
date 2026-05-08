# CLAUDE.md

## Project Overview

Biome linter plugin for roblox-ts projects. Port of [eslint-plugin-roblox-ts](https://github.com/roblox-ts/eslint-plugin-roblox-ts) to Biome using GritQL rules.

## Architecture

- `biome.json` - Plugin configuration that consumers extend via `@rbxts/biome-plugin-roblox-ts/biome`
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

### Use native PascalCase AST node patterns for declarations and statements

Literal-string GritQL patterns (e.g. `` `enum $name { $body }` ``, `` `for ($k in $o)` ``, `` `$label: $stmt` ``) do not fire as plugins for many declaration and statement node types. Use Biome's native PascalCase AST node names instead — these were added in Biome 2.2.6 (#7510) and reliably fire as plugins:

- `JsLabeledStatement()`, `JsForInStatement()`, `JsForOfStatement()`
- `TsEnumDeclaration()`, `TsModuleDeclaration()` (TS namespaces)
- `JsGetterClassMember()`, `JsSetterClassMember()`, `JsGetterObjectMember()`, `JsSetterObjectMember()`
- `JsPrivateClassMemberName()` (matches `#name`)

Native nodes also accept field metavariables matching the `.ungram` grammar (added in 2.4.10, #9739): `JsLabeledStatement(body = JsExpressionStatement(expression = JsCallExpression()))`.

Use `biome search 'YourPattern()' file.ts` to verify a pattern matches before wiring it into a plugin.

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
2. In the test project: `npm link @rbxts/biome-plugin-roblox-ts`
3. Add `"extends": ["@rbxts/biome-plugin-roblox-ts/biome"]` to the test project's `biome.json`
4. Run: `npx @biomejs/biome lint .`

The `~/Desktop/roblox-moba` project can be used for integration testing.

To test a GritQL pattern directly without the plugin system:

```bash
npx @biomejs/biome search '`your_pattern`' ./path/to/file.ts
```

## Publishing

The package is published to npm as `@rbxts/biome-plugin-roblox-ts`. The `files` field in `package.json` includes only `rules/` and `biome.json`. Version bumps and releases are handled by the GitHub Actions workflow in `.github/workflows/release.yml`.

## Key Limitations

- **No autofix**: GritQL plugins can only report diagnostics, not fix code. GritQL is the only third-party plugin mechanism — there is no WASM/JS/Rust plugin API for external authors.
- **No TypeScript types**: GritQL cannot access type information. 3 rules are placeholders (`noUndeclaredScope`, `misleadingLuatupleChecks`, full `sizeMethod` semantics) and contain `false` in their `where` clause. They could only be implemented as native Rust rules contributed upstream to Biome.
