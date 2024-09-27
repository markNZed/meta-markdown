#!/usr/bin/env node

/**
 * Script to convert JS/JSX files in a project to TS/TSX.
 * 
 * Usage:
 *   node convert-js-to-ts.mjs
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Recursively traverse directories and collect file paths.
 * @param {string} dir - The directory to traverse.
 * @param {string[]} fileList - Accumulator for file paths.
 * @returns {Promise<string[]>} - Array of file paths.
 */
async function getAllFiles(dir, fileList = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip node_modules and hidden directories
            if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
                continue;
            }
            await getAllFiles(fullPath, fileList);
        } else if (entry.isFile()) {
            if (/\.(js|jsx)$/.test(entry.name)) {
                fileList.push(fullPath);
            }
        }
    }
    return fileList;
}

/**
 * Rename file extensions from .js/.jsx to .ts/.tsx
 * @param {string[]} files - Array of file paths.
 */
async function renameFiles(files) {
    for (const file of files) {
        const dir = path.dirname(file);
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        let newExt;
        if (ext === '.js') {
            newExt = '.ts';
        } else if (ext === '.jsx') {
            newExt = '.tsx';
        } else {
            continue; // Shouldn't reach here
        }
        const newFile = path.join(dir, baseName + newExt);
        try {
            await fs.rename(file, newFile);
            console.log(`Renamed: ${file} -> ${newFile}`);
        } catch (err) {
            console.error(`Failed to rename ${file}:`, err);
        }
    }
}

/**
 * Create a basic tsconfig.json if it doesn't exist.
 */
async function createTsConfig() {
    const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
    try {
        await fs.access(tsConfigPath);
        console.log('tsconfig.json already exists.');
    } catch {
        const tsConfig = {
            "compilerOptions": {
                "target": "ES6",
                "module": "commonjs",
                "strict": true,
                "esModuleInterop": true,
                "skipLibCheck": true,
                "forceConsistentCasingInFileNames": true,
                "outDir": "dist",
                "rootDir": "src",
                "allowJs": true,
                "checkJs": false
            },
            "include": ["src"],
            "exclude": ["node_modules", "**/*.spec.ts"]
        };
        try {
            await fs.writeFile(tsConfigPath, JSON.stringify(tsConfig, null, 4));
            console.log('Created tsconfig.json.');
        } catch (err) {
            console.error('Failed to create tsconfig.json:', err);
        }
    }
}

/**
 * Main function to execute the conversion.
 */
async function main() {
    const projectRoot = process.cwd();
    console.log(`Starting conversion in project: ${projectRoot}`);

    try {
        const files = await getAllFiles(projectRoot);
        if (files.length === 0) {
            console.log('No .js or .jsx files found to convert.');
            return;
        }
        console.log(`Found ${files.length} files to rename.`);
        await renameFiles(files);
        await createTsConfig();
        console.log('Conversion completed.');
        console.log('Next steps:');
        console.log('1. Install TypeScript if not already installed: npm install --save-dev typescript');
        console.log('2. Run the TypeScript compiler: npx tsc');
        console.log('3. Gradually add type annotations and resolve any type errors.');
    } catch (err) {
        console.error('An error occurred during conversion:', err);
    }
}

main();
