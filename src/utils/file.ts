/**
 * @module FileUtilities
 * 
 * This module provides utility functions for file and directory operations, including resolving paths,
 * retrieving file paths from directories, and ensuring that directories exist.
 * 
 * @function resolvePath
 * @param {string} filePath - The file path to resolve. Can be an absolute path or a relative path.
 * @returns {string} - The resolved absolute file path based on the configured root directory.
 * 
 * @function getFilePaths
 * @param {string | string[]} input - A single file path, array of file paths, or glob pattern to search for files.
 * @returns {Promise<string[]>} - A promise that resolves to an array of file paths. It collects paths for both files and
 * directories, recursively searching for markdown files in directories.
 * 
 * @function ensureDir
 * @param {string} dirPath - The directory path to ensure exists.
 * @returns {Promise<void>} - A promise that resolves when the directory exists, creating it if necessary.
 * 
 * @example
 * // Resolving a file path
 * const absolutePath = resolvePath('relative/path/to/file.txt');
 * 
 * // Getting file paths
 * const files = await getFilePaths(['path/to/dir', 'path/to/file.txt', '*.md']);
 * 
 * // Ensuring a directory exists
 * await ensureDir('path/to/directory');
 
 * @hash e28f0c8a9beab722b4d86a028d890e9c638bb095e9008ec8fd5517308f2dcbcb
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