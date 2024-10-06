/**
 * This module provides functions to traverse a directory structure, count tokens in Markdown files, and print the structure in a readable format.
 * 
 * Exported Functions:
 * 
 * - `buildDirectoryStructure(dirPath: string): Promise<DirectoryStructure>`: Asynchronously builds a hierarchical representation of a directory structure starting from the specified `dirPath`. It includes token counts for Markdown files using the `countTokens` function from '@/utils/llm/tokenizer.ts'.
 * 
 * - `printDirectoryStructure(structure: DirectoryStructure, indent?: string): number`: Recursively prints the directory structure in a tree-like format including token counts. It returns the total token count for the printed structure.
 * 
 * - `summarizeDirectory(dirPath: string): Promise<{ structure: DirectoryStructure; totalTokens: number }>`: Combines the functionality of `buildDirectoryStructure` and `printDirectoryStructure` to provide a summary of the directory structure with token counts, returning both the structure and the total number of tokens.
 * 
 * Usage:
 * 
 * If running this script directly with Deno, provide a directory path to analyze:
 * 
 * ```shell
 * deno run --allow-read --import-map=import_map.json tokenCount.ts <directory_path>
 * ```
 * 
 * This will output the directory structure with token counts and the overall total token count.
 */

import { countTokens } from "@/utils/llm/tokenizer.ts";

/**
 * Interface to represent the structure of directories and files with token counts.
 */
export interface DirectoryStructure {
  name: string;
  type: "directory" | "file";
  path: string;
  tokenCount?: number;
  children?: DirectoryStructure[];
}

/**
 * Recursively builds the directory structure with token counts.
 * @param dirPath - The path of the directory to traverse.
 * @returns A DirectoryStructure object representing the directory and its contents.
 */
export async function buildDirectoryStructure(dirPath: string): Promise<DirectoryStructure> {
  const dirStructure: DirectoryStructure = {
    name: getNameFromPath(dirPath),
    path: dirPath,
    type: "directory",
    children: [],
  };

  try {
    const entries = [...Deno.readDirSync(dirPath)];

    for (const entry of entries) {
      const fullPath = `${dirPath}/${entry.name}`;
      if (entry.isDirectory) {
        // Recursive call for subdirectories
        const subDir = await buildDirectoryStructure(fullPath);
        dirStructure.children!.push(subDir);
      } else if (entry.isFile && fullPath.endsWith(".md")) {
        // Handle Markdown files
        const fileContent = await Deno.readTextFile(fullPath);
        const tokenCount = countTokens(fileContent);

        const fileStructure: DirectoryStructure = {
          name: entry.name,
          path: fullPath,
          type: "file",
          tokenCount,
        };

        dirStructure.children!.push(fileStructure);
      }
      // You can handle other file types here if needed
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return dirStructure;
}

/**
 * Helper function to extract the name from a path.
 * @param path - The full path.
 * @returns The name of the file or directory.
 */
function getNameFromPath(path: string): string {
  return path.split("/").pop() || path;
}

/**
 * Prints the directory structure with token counts in a tree-like format and includes aggregate counts.
 * @param structure - The DirectoryStructure object to print.
 * @param indent - The current indentation level (used for recursion).
 * @returns The total token count for the current directory.
 */
export function printDirectoryStructure(structure: DirectoryStructure, indent: string = ""): number {
  let totalTokens = 0;

  if (structure.type === "directory") {
    console.log(`${indent}${structure.name}/`);
    structure.children?.forEach((child) => {
      totalTokens += printDirectoryStructure(child, indent + "  ");
    });
    console.log(`${indent}Total Tokens: ${totalTokens}\n`);
  } else if (structure.type === "file") {
    console.log(`${indent}${structure.name} - Tokens: ${structure.tokenCount}`);
    totalTokens += structure.tokenCount ?? 0;
  }

  return totalTokens;
}

/**
 * Utility function to summarize the directory structure based on token counts.
 * @param dirPath - The directory path to summarize.
 * @returns The summary of the directory structure including token counts.
 */
export async function summarizeDirectory(dirPath: string): Promise<{ structure: DirectoryStructure; totalTokens: number }> {
  const structure = await buildDirectoryStructure(dirPath);
  const totalTokens = printDirectoryStructure(structure);
  return { structure, totalTokens };
}

/**
 * Main function to execute the script if run directly.
 */
if (import.meta.main) {
  const args = Deno.args;

  if (args.length < 1) {
    console.error("Usage: deno run --allow-read --import-map=import_map.json tokenCount.ts <directory_path>");
    Deno.exit(1);
  }

  const targetDir = args[0];

  try {
    const structure = await buildDirectoryStructure(targetDir);
    const totalTokens = printDirectoryStructure(structure);
    console.log(`Overall Total Tokens: ${totalTokens}`);
  } catch (error) {
    console.error("Error building directory structure:", error);
  }
}
