/**
 * biome-plugin-roblox-ts
 * 
 * Biome GritQL plugin providing roblox-ts specific linting rules.
 * 
 * This package contains 43+ custom rules for roblox-ts development,
 * including rules for TypeScript restrictions, Lua compatibility,
 * and Roblox-specific patterns.
 * 
 * @author StephenSHorton
 * @license MIT
 */

import { updateBiomeConfig } from './scripts/postinstall.js';

export { updateBiomeConfig };

// Package information
export const name = 'biome-plugin-roblox-ts';
export const version = '0.1.0';
export const description = 'Biome GritQL rules for roblox-ts projects';

// For CommonJS compatibility
export default {
    updateBiomeConfig,
    name,
    version,
    description
};