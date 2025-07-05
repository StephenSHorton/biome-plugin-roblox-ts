#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

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
    while (current !== '/') {
        if (existsSync(resolve(current, 'package.json'))) {
            return current;
        }
        current = dirname(current);
    }
    
    return process.cwd();
}

function getBiomeConfigPath(projectRoot) {
    const candidates = [
        resolve(projectRoot, 'biome.json'),
        resolve(projectRoot, 'biome.jsonc'),
        resolve(projectRoot, '.biome.json'),
        resolve(projectRoot, '.biome.jsonc')
    ];
    
    for (const candidate of candidates) {
        if (existsSync(candidate)) {
            return candidate;
        }
    }
    
    // Default to biome.json if none exists
    return resolve(projectRoot, 'biome.json');
}

function getPluginPaths() {
    // Get the path to this package's biome.json
    const packageRoot = resolve(__dirname, '..');
    const pluginBiomeConfig = resolve(packageRoot, 'biome.json');
    
    if (!existsSync(pluginBiomeConfig)) {
        throw new Error('Plugin biome.json not found');
    }
    
    const pluginConfig = JSON.parse(readFileSync(pluginBiomeConfig, 'utf8'));
    const pluginPaths = pluginConfig.plugins || [];
    
    // Convert relative paths to paths relative to node_modules
    return pluginPaths.map(path => {
        if (path.startsWith('./rules/')) {
            return `./node_modules/biome-plugin-roblox-ts/rules/${path.substring(8)}`;
        }
        return path;
    });
}

function updateBiomeConfig() {
    try {
        const projectRoot = findProjectRoot();
        const biomeConfigPath = getBiomeConfigPath(projectRoot);
        const pluginPaths = getPluginPaths();
        
        log(`Project root: ${projectRoot}`);
        log(`Biome config: ${biomeConfigPath}`);
        
        let config = {};
        
        // Read existing config if it exists
        if (existsSync(biomeConfigPath)) {
            try {
                const content = readFileSync(biomeConfigPath, 'utf8');
                config = JSON.parse(content);
                log('Found existing biome.json, updating...');
            } catch (error) {
                log(`Warning: Could not parse existing biome.json: ${error.message}`);
                log('Creating new configuration...');
            }
        } else {
            log('No existing biome.json found, creating new one...');
        }
        
        // Ensure plugins array exists
        if (!config.plugins) {
            config.plugins = [];
        }
        
        // Add our plugin paths, avoiding duplicates
        let addedCount = 0;
        for (const pluginPath of pluginPaths) {
            if (!config.plugins.includes(pluginPath)) {
                config.plugins.push(pluginPath);
                addedCount++;
            }
        }
        
        // Ensure proper schema
        if (!config.$schema) {
            config.$schema = "https://biomejs.dev/schemas/2.0.6/schema.json";
        }
        
        // Write updated config
        writeFileSync(biomeConfigPath, JSON.stringify(config, null, '\t') + '\n');
        
        if (addedCount > 0) {
            log(` Successfully added ${addedCount} roblox-ts rules to your biome.json`);
            log(`=Ý Configuration file: ${biomeConfigPath}`);
            log('=€ Your project now includes roblox-ts specific linting rules!');
        } else {
            log('9  roblox-ts rules already configured in your biome.json');
        }
        
    } catch (error) {
        log(`L Error configuring biome.json: ${error.message}`);
        log('=¡ You can manually add the plugin rules to your biome.json:');
        log('   Add the plugin paths to the "plugins" array in your biome.json');
        process.exit(1);
    }
}

function main() {
    log('Setting up biome-plugin-roblox-ts...');
    
    // Check if we're in a valid project
    const projectRoot = findProjectRoot();
    if (!existsSync(resolve(projectRoot, 'package.json'))) {
        log('   No package.json found. Skipping automatic configuration.');
        log('=¡ Run this script from your project root to configure biome.json');
        return;
    }
    
    updateBiomeConfig();
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { updateBiomeConfig };