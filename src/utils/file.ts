/**
 * This module provides utility functions for file path resolution and directory management.
 *
 * Functions:
 *
 * - `resolvePath(filePath: string): string`: Resolves a given file path to an absolute path based on the root directory specified in the configuration. If the path is already absolute, it returns the path unchanged. Use this function to ensure paths are consistent relative to the application root.
 *
 * - `getFilePaths(input: string | string[]): Promise<string[]>`: Asynchronously retrieves file paths from given input(s). The input can be a single path or an array of paths, which can be files, directories, or glob patterns. This function returns an array of file paths, recursively including markdown files if a directory is specified.
 *
 * - `ensureDir(dirPath: string): Promise<void>`: Ensures that a directory exists at the specified path, creating it if necessary. This is useful for preparing the filesystem for file operations that require a directory to be present.
 */

import { config } from '@/config.ts';
import { resolve } from "@std/path"; // For path resolution
import { walk, expandGlob } from "https://deno.land/std/fs/mod.ts";

/**
 * Resolves a given file path to an absolute path based on rootDir.
 * @param {string} filePath - The file path to resolve.
 * @returns {string} - The resolved absolute file path.
 */
export function resolvePath(filePath: string): string {
    // If the provided path is already absolute, return it
    if (filePath.startsWith('/') || filePath.startsWith('C:\\') || filePath.startsWith('D:\\')) {
      return resolve(filePath);
    }
    // Otherwise, resolve it relative to the root directory
    return resolve(config.rootDir, filePath);
}

export const getFilePaths = async (input: string | string[]): Promise<string[]> => {
    const inputs = Array.isArray(input) ? input : [input];
    const filePaths: string[] = [];
  
    for (const item of inputs) {
      const fullPath = resolve(item);
  
      try {
        const fileInfo = await Deno.stat(fullPath);
  
        if (fileInfo.isFile) {
          // It's a file
          filePaths.push(fullPath);
        } else if (fileInfo.isDirectory) {
          // It's a directory; recursively collect markdown files
          for await (const entry of walk(fullPath, { includeDirs: false, exts: [".md", ".markdown"] })) {
            filePaths.push(entry.path);
          }
        }
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          // Assume it's a glob pattern
          const files = await expandGlobPattern(item);
          filePaths.push(...files);
        } else if (error instanceof Error) {
          console.error(`Error accessing ${item}: ${error.message}`);
        }
      }
    }
  
    return filePaths;
};
  
const expandGlobPattern = async (pattern: string): Promise<string[]> => {
    const matchingFiles: string[] = [];
    for await (const entry of expandGlob(pattern)) {
      if (entry.isFile) {
        matchingFiles.push(entry.path);
      }
    }
    return matchingFiles;
};
  
// Function to ensure that a directory exists, creating it if necessary
export async function ensureDir(dirPath: string): Promise<void> {
    try {
      await Deno.mkdir(dirPath, { recursive: true });
    } catch (err) {
      if (!(err instanceof Deno.errors.AlreadyExists)) {
        throw err;
      }
    }
}