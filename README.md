![cover](/cover.png)

# biome-plugin-roblox-ts

A comprehensive Biome plugin providing **43+ GritQL linting rules** specifically designed for [roblox-ts](https://roblox-ts.com/) development.

This plugin enforces TypeScript restrictions, Lua compatibility patterns, and Roblox-specific best practices to help you write better roblox-ts code.

## ✨ Features

- 🚀 **43+ Custom Rules** - Comprehensive coverage of roblox-ts specific patterns
- ⚡ **Automatic Setup** - Postinstall script automatically configures your `biome.json`
- 🔧 **Zero Configuration** - Works out of the box with sensible defaults
- 🎯 **TypeScript Focused** - Enforces roblox-ts TypeScript restrictions
- 🌙 **Lua Compatible** - Prevents patterns that don't translate well to Lua
- 🎮 **Roblox Specific** - Rules tailored for the Roblox platform

## 📦 Installation

```bash
# npm
npm install --save-dev biome-plugin-roblox-ts

# bun
bun add -D biome-plugin-roblox-ts

# yarn
yarn add -D biome-plugin-roblox-ts
```

The postinstall script will automatically configure your `biome.json` file. If you need to run it manually:

```bash
npm run configure
```

## 🎛️ Configuration

After installation, your `biome.json` will be automatically updated to include all roblox-ts rules:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.6/schema.json",
  "plugins": [
    "./node_modules/biome-plugin-roblox-ts/rules/noGlobalThis.grit",
    "./node_modules/biome-plugin-roblox-ts/rules/noNull.grit",
    // ... 40+ more rules
  ]
}
```

## 📋 Rules Overview

### Core Language Features (11 rules)
- `noGlobalThis` - Bans globalThis usage
- `noNull` - Bans null usage (use undefined instead)
- `noDebugger` - Bans debugger statements
- `noDelete` - Bans delete operator
- `noVoidExpression` - Bans void expressions
- `noValueTypeOf` - Bans typeof operator
- `noPrototype` - Bans .prototype access
- `noWithStatement` - Bans with statements
- `noLabels` - Bans labeled statements
- `noForIn` - Bans for-in loops (use for-of instead)
- `noRegex` - Bans regex literals

### Operators & Expressions (7 rules)
- `noEqualityOperators` - Bans == operator (use === instead)
- `noInequalityOperators` - Bans != operator (use !== instead)
- `noObjectMath` - Bans + operator on Roblox data types
- `noMathSub` - Bans - operator (use .sub() method)
- `noMathMul` - Bans * operator (use .mul() method)
- `noMathDiv` - Bans / operator (use .div() method)
- `noNonNullAssertion` - Bans ! assertion operator

### TypeScript Features (6 rules)
- `noAnyType` - Bans any type (use unknown instead)
- `noEnumMerging` - Bans enum declarations
- `noNamespaceMerging` - Bans namespace declarations
- `noPrivateIdentifier` - Bans # private fields
- `noGettersOrSetters` - Bans getter methods
- `noSetters` - Bans setter methods

### Roblox-Specific (8 rules)
- `noArrayPairs` - Bans pairs() function on arrays
- `noArrayIPairs` - Bans ipairs() function on arrays
- `noRbxPostFixNew` - Bans .new() method calls (use new X() instead)
- `preferTaskLibrary` - Prefers task library over coroutine
- `requireModule` - Prefers import statements over require()
- `noReservedLuaKeywords` - Bans Lua reserved keywords as identifiers
- `noLuaKeywordEnd` - Bans 'end' keyword usage
- `noLuaKeywordLocal` - Bans 'local' keyword usage
- `noLuaKeywordNil` - Bans 'nil' keyword usage

### Control Flow & Patterns (11 rules)
- `luaTruthiness` - Warns about falsy values in conditions
- `luaTruthinessZero` - Warns about 0 in if statements
- `luaTruthinessNaN` - Warns about NaN in if statements
- `noUndefinedReturn` - Bans explicit undefined returns
- `noArrayAccess` - Bans string literal array access
- `noSpreadDestructuring` - Bans spread in destructuring
- `noSpreadingTuples` - Bans spreading tuples
- `noFunctionExpressionName` - Bans named function expressions
- `noExportAssignmentLet` - Bans export = syntax
- `noPrecedingSpreadElement` - Enforces spread comes last in arguments

## 🔧 Manual Configuration

If the automatic setup doesn't work, you can manually add the plugin rules to your `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.6/schema.json",
  "plugins": [
    "./node_modules/biome-plugin-roblox-ts/rules/noGlobalThis.grit"
  ]
}
```

Or run the configuration script manually:

```bash
npx biome-plugin-roblox-ts configure
```

## 🚀 Usage

Once configured, Biome will automatically apply these rules when you run:

```bash
npx biome check .
npx biome lint .
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Related Projects

- [roblox-ts](https://roblox-ts.com/) - TypeScript to Lua compiler for Roblox
- [Biome](https://biomejs.dev/) - Fast formatter and linter for web projects
- [GritQL](https://docs.grit.io/language/overview) - Pattern matching language for code

---

Made with ❤️ for the roblox-ts community