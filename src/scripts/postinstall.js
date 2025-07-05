#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Postinstall script for biome-plugin-roblox-ts
 * Automatically configures the user's biome.json to extend this plugin
 */

function log(message) {
	console.log(`[biome-plugin-roblox-ts] ${message}`);
}

function findProjectRoot() {
	let current = process.cwd();

	// Look for package.json to find project root
	while (current !== "/") {
		if (existsSync(resolve(current, "package.json"))) {
			return current;
		}
		current = dirname(current);
	}

	return process.cwd();
}

function getBiomeConfigPath(projectRoot) {
	const candidates = [
		resolve(projectRoot, "biome.json"),
		resolve(projectRoot, "biome.jsonc"),
		resolve(projectRoot, ".biome.json"),
		resolve(projectRoot, ".biome.jsonc"),
	];

	for (const candidate of candidates) {
		if (existsSync(candidate)) {
			return candidate;
		}
	}

	// Default to biome.json if none exists
	return resolve(projectRoot, "biome.json");
}

function getExtendPath() {
	// Return the extends path for this package
	return "biome-plugin-roblox-ts/biome";
}

function updateBiomeConfig() {
	try {
		const projectRoot = findProjectRoot();
		const biomeConfigPath = getBiomeConfigPath(projectRoot);
		const extendPath = getExtendPath();

		log(`Project root: ${projectRoot}`);
		log(`Biome config: ${biomeConfigPath}`);

		let config = {};

		// Read existing config if it exists
		if (existsSync(biomeConfigPath)) {
			try {
				const content = readFileSync(biomeConfigPath, "utf8");
				config = JSON.parse(content);
				log("Found existing biome.json, updating...");
			} catch (error) {
				log(`Warning: Could not parse existing biome.json: ${error.message}`);
				log("Creating new configuration...");
			}
		} else {
			log("No existing biome.json found, creating new one...");
		}

		// Ensure extends array exists
		if (!config.extends) {
			config.extends = [];
		}

		// Add our extend path, avoiding duplicates
		let wasAdded = false;
		if (!config.extends.includes(extendPath)) {
			config.extends.push(extendPath);
			wasAdded = true;
		}

		// Ensure proper schema
		if (!config.$schema) {
			config.$schema = "https://biomejs.dev/schemas/2.0.6/schema.json";
		}

		// Write updated config
		writeFileSync(biomeConfigPath, JSON.stringify(config, null, "\t") + "\n");

		if (wasAdded) {
			log(
				`✅ Successfully added biome-plugin-roblox-ts to your biome.json extends`,
			);
			log(`📁 Configuration file: ${biomeConfigPath}`);
			log("🎉 Your project now includes roblox-ts specific linting rules!");
		} else {
			log("✅ biome-plugin-roblox-ts already configured in your biome.json");
		}
	} catch (error) {
		log(`❌ Error configuring biome.json: ${error.message}`);
		log("💡 You can manually add the extends to your biome.json:");
		log('   Add "biome-plugin-roblox-ts/biome" to the "extends" array in your biome.json');
		process.exit(1);
	}
}

function main() {
	log("Setting up biome-plugin-roblox-ts...");

	// Check if we're in a valid project
	const projectRoot = findProjectRoot();
	if (!existsSync(resolve(projectRoot, "package.json"))) {
		log("⚠️  No package.json found. Skipping automatic configuration.");
		log("💡 Run this script from your project root to configure biome.json");
		return;
	}

	updateBiomeConfig();
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}

export { updateBiomeConfig };