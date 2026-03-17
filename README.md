![cover](/cover.png)

# biome-plugin-roblox-ts

A port of the [eslint-plugin-roblox-ts](https://github.com/roblox-ts/eslint-plugin-roblox-ts) ruleset to [Biome](https://biomejs.dev/). Designed for [roblox-ts](https://roblox-ts.com/) development.

This plugin enforces TypeScript restrictions, Lua compatibility patterns, and Roblox-specific best practices using [GritQL](https://docs.grit.io/language/overview) rules.

> **Status**: Many rules work today but some are blocked by Biome's plugin system which only visits a limited set of AST node types. Blocked rules are kept in the codebase and will activate as Biome expands plugin support. See [Limitations](#limitations) for details.

## Installation

### 1. Install Biome and the Plugin

```bash
# npm
npm install --save-dev @biomejs/biome biome-plugin-roblox-ts

# bun
bun add -D @biomejs/biome biome-plugin-roblox-ts

# yarn
yarn add -D @biomejs/biome biome-plugin-roblox-ts
```

### 2. Initialize Biome (if not already done)

```bash
npx @biomejs/biome init
```

### 3. Install Biome VS Code Extension

Install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for IDE integration.

## Configuration

Add the plugin to your `biome.json`:

```json
{
  "extends": ["biome-plugin-roblox-ts/biome"]
}
```

### Customizing Rules

You can disable or adjust specific rules in your `biome.json`:

```json
{
  "linter": {
    "rules": {
      "nursery": {
        "noNull": "off",
        "noAnyType": "warn"
      }
    }
  }
}
```

## Rules

Rules marked with ^ are blocked by a Biome plugin limitation and do not currently fire diagnostics. They are included so they will automatically activate when Biome expands its plugin node type support.

### Lua Truthiness (3 rules)

| Rule | Description |
|------|-------------|
| `luaTruthiness` | Warns when empty strings are used in conditions (falsy in TS but truthy in Lua) |
| `luaTruthinessZero` | Warns when `0` is used in conditions (falsy in TS but truthy in Lua) |
| `luaTruthinessNaN` | Warns when `NaN` is used in conditions (falsy in TS but truthy in Lua) |

### Operators & Math (5 rules)

| Rule | Description |
|------|-------------|
| `noObjectMath` | Bans `+` operator on Roblox data types (use `.add()`) |
| `noMathSub` | Bans `-` operator on Roblox data types (use `.sub()`) |
| `noMathMul` | Bans `*` operator on Roblox data types (use `.mul()`) |
| `noMathDiv` | Bans `/` operator on Roblox data types (use `.div()`) |
| `sizeMethod`* | Warns on `.length` property access (use `.size()` method instead) |

### TypeScript Restrictions (7 rules)

| Rule | Description |
|------|-------------|
| `noAnyType` | Bans `any` type (use `unknown` instead) |
| `noEnumMerging`^ | Bans enum declarations (enum merging is not supported) |
| `noNamespaceMerging`^ | Bans namespace declarations (namespace merging is not supported) |
| `noPrivateIdentifier`^ | Bans `#` private fields (not supported in Luau) |
| `noGettersOrSetters`^ | Bans getter methods (not supported for performance reasons) |
| `noSetters`^ | Bans setter methods (not supported for performance reasons) |
| `noExportAssignmentLet` | Bans `export =` syntax |

### Lua Compatibility (5 rules)

| Rule | Description |
|------|-------------|
| `noInvalidIdentifier` | Bans Luau reserved keywords as identifiers (`and`, `end`, `local`, `nil`, `not`, `or`, `elseif`, `repeat`, `then`, `until`) |
| `noNull` | Bans `null` (use `undefined` instead, which maps to Lua `nil`) |
| `noForIn`^ | Bans for-in loops (iterator always types as `string`; use for-of) |
| `noArrayPairs` | Bans `pairs()` on arrays (indices won't be shifted from 1-indexed) |
| `noArrayIPairs` | Bans `ipairs()` on arrays (indices won't be shifted from 1-indexed) |

### Unsupported Syntax (5 rules)

| Rule | Description |
|------|-------------|
| `noGlobalThis` | Bans `globalThis` (not supported in Luau) |
| `noLabels`^ | Bans labeled statements (not supported in Luau) |
| `noPrototype` | Bans `.prototype` access (not supported in Luau) |
| `noRegex` | Bans regex literals (not supported in Luau) |
| `noSpreadingTuples` | Bans spreading tuples (not supported in Luau) |

### Roblox-Specific (6 rules)

| Rule | Description |
|------|-------------|
| `noRbxPostFixNew` | Bans `.new()` (use `new X()` instead) |
| `noImplicitSelf`^ | Bans `:` method call syntax (use `.` instead) |
| `preferTaskLibrary` | Prefers `task` library over `coroutine` for better performance |
| `preferGetPlayers` | Prefers `Players.GetPlayers()` over `Players.GetChildren()` |
| `noValueTypeOf` | Bans `typeof` operator (use `typeIs()` or `typeOf()`) |
| `noPrecedingSpreadElement` | Enforces spread element comes last in arguments |

### Other (3 rules)

| Rule | Description |
|------|-------------|
| `noFunctionExpressionName` | Bans named function expressions |
| `misleadingLuatupleChecks`* | Warns about LuaTuple in conditional expressions |
| `noUndeclaredScope`* | Validates scoped npm packages against typeRoots |

### Built-in Biome Rules (4 rules)

These rules are provided by Biome itself and enabled as warnings:

- `noDebugger` - Bans debugger statements
- `noDelete` - Bans delete operator
- `noNonNullAssertion` - Bans `!` assertion operator
- `noWithStatement` - Bans with statements

## Limitations

### Biome Plugin Node Type Support (^)

Biome's GritQL plugin system currently only visits a limited set of AST node types (expressions, identifiers, literals, and a few statement types). Patterns that target declarations (enums, namespaces), class members (getters/setters), for-in statements, labeled statements, and private identifiers do not fire as lint diagnostics — even though they match correctly in `biome search`.

**8 rules are blocked by this limitation:**
`noEnumMerging`, `noGettersOrSetters`, `noSetters`, `noNamespaceMerging`, `noLabels`, `noForIn`, `noImplicitSelf`, `noPrivateIdentifier`

These rules are kept in the plugin so they will automatically start working when Biome expands its plugin support. You can verify the patterns work today using `biome search`:

```bash
npx @biomejs/biome search '`enum $name { $body }`' ./src/
```

### TypeScript Type Information (*)

GritQL does not have access to TypeScript's type checker:

- **`misleadingLuatupleChecks`** - Cannot detect `LuaTuple` types
- **`noUndeclaredScope`** - Cannot read tsconfig `typeRoots` or check file system
- **`sizeMethod`** - Cannot verify if `.length` is on a string/array vs other types (may produce false positives)

For full type-aware linting, use the original [eslint-plugin-roblox-ts](https://github.com/roblox-ts/eslint-plugin-roblox-ts) alongside this plugin.

## Testing

```bash
bun test
```

Tests use Bun's test runner with fixture files in `tests/invalid/` and `tests/valid/`. Rules blocked by Biome limitations are automatically skipped.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Related Projects

- [roblox-ts](https://roblox-ts.com/) - TypeScript to Lua compiler for Roblox
- [eslint-plugin-roblox-ts](https://github.com/roblox-ts/eslint-plugin-roblox-ts) - The original ESLint plugin this is ported from
- [Biome](https://biomejs.dev/) - Fast formatter and linter for web projects
- [GritQL](https://docs.grit.io/language/overview) - Pattern matching language for code
