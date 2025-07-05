![cover](/cover.png)

# biome-plugin-roblox-ts

A port of the [eslint-plugin-roblox-ts](https://github.com/roblox-ts/eslint-plugin-roblox-ts) ruleset to Biome. Designed for [roblox-ts](https://roblox-ts.com/) development.

This plugin enforces TypeScript restrictions, Lua compatibility patterns, and Roblox-specific best practices to help you write better roblox-ts code.

## ✨ Features

- ⚡ **Automatic Setup** - Postinstall script automatically configures your `biome.json`
- 🎯 **TypeScript Focused** - Enforces roblox-ts TypeScript restrictions
- 🌙 **Lua Compatible** - Prevents patterns that don't translate well to Lua
- 🎮 **Roblox Specific** - Rules tailored for the Roblox platform

## 📦 Installation

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

Install the [Biome VS Code extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for IDE integration:

- Open VS Code
- Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
- Search for "Biome"
- Install the official Biome extension by the Biome team

## 🎛️ Configuration

After installation, add the plugin to your `biome.json` configuration:

```json
{
  "extends": ["biome-plugin-roblox-ts/biome"],
}
```

### Customizing Rules

You can disable specific rules or change their severity by overriding them in your `biome.json`:

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

## 📋 Rules Overview

### Built-in Biome Rules (4 rules)
These rules are provided by Biome itself and are enabled as warnings in the plugin configuration:
- `noDebugger` - Bans debugger statements
- `noDelete` - Bans delete operator
- `noNonNullAssertion` - Bans ! assertion operator
- `noWithStatement` - Bans with statements

### Core Language Features (7 rules)
- `noGlobalThis` - Bans globalThis usage
- `noNull` - Bans null usage (use undefined instead)
- `noVoidExpression` - Bans void expressions
- `noValueTypeOf` - Bans typeof operator
- `noPrototype` - Bans .prototype access
- `noLabels` - Bans labeled statements
- `noForIn` - Bans for-in loops (use for-of instead)
- `noRegex` - Bans regex literals

### Operators & Expressions (6 rules)
- `noEqualityOperators` - Bans == operator (use === instead)
- `noInequalityOperators` - Bans != operator (use !== instead)
- `noObjectMath` - Bans + operator on Roblox data types
- `noMathSub` - Bans - operator (use .sub() method)
- `noMathMul` - Bans * operator (use .mul() method)
- `noMathDiv` - Bans / operator (use .div() method)

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