// src/scripts/listTsFiles.ts

import { walk } from "https://deno.land/std@0.203.0/fs/mod.ts";
import { resolve } from "https://deno.land/std@0.203.0/path/mod.ts";
import { config } from '@/config.ts';
import logger from '@/utils/logger.ts';

/**
 * Lists all relevant TypeScript (.ts) files within the src directory,
 * excluding server.ts, test files, and specific directories like node_modules, dist, and scripts (except blocks).
 *
 * @returns {Promise<string[]>} - An array of absolute paths to the relevant .ts files.
 */
export async function listTsFiles(): Promise<string[]> {
  const srcDir = resolve(config.rootDir, 'src'); // Dynamically resolve src directory based on rootDir

  // Log the root and src directories
  logger.debug(`Project Root Directory: ${config.rootDir}`, { requestId: 'listTsFiles' });
  logger.debug(`Resolved src directory: ${srcDir}`, { requestId: 'listTsFiles' });

  // Ensure the src directory exists
  try {
    const stats = await Deno.stat(srcDir);
    if (!stats.isDirectory) {
      logger.error(`Error: ${srcDir} is not a directory.`, { requestId: 'listTsFiles' });
      return [];
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error: Cannot access ${srcDir}. ${error.message}`, { requestId: 'listTsFiles' });
    } else {
      logger.error(`Error: Cannot access ${srcDir}. Unknown error: ${error}`, { requestId: 'listTsFiles' });
    }
    return [];
  }

  const tsFiles: string[] = [];

  // Walk through the src directory to find .ts files
  for await (const entry of walk(srcDir, { exts: [".ts"], includeDirs: false })) {
    const filePath = resolve(entry.path);

    // Skip test files
    if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.spec.ts')) {
      logger.debug(`Skipping test file: ${filePath}`, { requestId: 'listTsFiles' });
      continue;
    }

    // Exclude specific files and directories
    if (
      entry.path.includes('node_modules') ||
      entry.path.includes('dist') ||
      entry.path.includes('.devcontainer') || 
      entry.path.endsWith('server.ts') || // Exclude server.ts
      (entry.path.includes('scripts') && !entry.path.includes('scripts/blocks')) // Exclude scripts dir except blocks
    ) {
      logger.debug(`Excluding file from ${entry.path}`, { requestId: 'listTsFiles' });
      continue;
    }

    tsFiles.push(filePath);
  }

  // Log the list of .ts files
  if (tsFiles.length === 0) {
    logger.info('No TypeScript files found in the src directory.', { requestId: 'listTsFiles' });
  } else {
    logger.info('List of relevant TypeScript files:', { requestId: 'listTsFiles' });
    tsFiles.forEach(file => {
      console.log(file);
    });
  }

  // Return the list for further processing
  return tsFiles;
}

// If the script is run directly, execute the function
if (import.meta.main) {
  await listTsFiles();
}
