#!/usr/bin/env deno run --allow-read --allow-write

/**
 * ------------------------------------------------------------------
 * Script Name: concatenate_project.ts
 * Description: Concatenates relevant project documentation and
 *              code files into a single file for AI review.
 *              For .ts files, extracts header comments unless specified
 *              to include full content based on inclusion list.
 * Usage:        deno run --allow-read --allow-write concatenate_project.ts
 * ------------------------------------------------------------------
 */

import { walk } from "https://deno.land/std@0.203.0/fs/walk.ts";

// Set the output file name
const OUTPUT_FILE = "concatenate_project.txt";

// Remove the output file if it already exists to avoid appending
try {
  await Deno.remove(OUTPUT_FILE);
  console.log(`Existing ${OUTPUT_FILE} removed.`);
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    // File does not exist, no action needed
  } else {
    console.error(`Error removing ${OUTPUT_FILE}:`, error);
    Deno.exit(1);
  }
}

// Define directories to exclude
const EXCLUDE_DIRS = [
  "node_modules",
  ".git",
  ".vscode",
  "dist",
  "build",
  "cache",
  "src/notebooks",
  "markdown_example",
  "markdown_private",
  "markdown_test",
  "markdown",
  "tests",
];

// Define file extensions to include
const INCLUDE_EXTENSIONS = ["js", "ts", "json", "md", "ipynb", "txt"];

// Define file names to exclude
const EXCLUDE_FILES = [
  OUTPUT_FILE,
  "package-lock.json",
  ".env",
  "convert-js-to-ts.js",
  "lock.json",
  "notes.txt",
  "concatenate_project.ts",
  "concatenate_project.sh",
];

// Define list of .ts files or glob patterns to include full content
const INCLUDE_FULL_TS_FILES = ["./src/config.ts"]; // Add paths or glob patterns as needed

/**
 * Checks if a file should be excluded based on EXCLUDE_FILES.
 * @param filePath - The path of the file to check.
 * @returns `true` if the file should be excluded, otherwise `false`.
 */
function shouldExcludeFile(filePath: string): boolean {
  const fileName = filePath.split("/").pop() || "";
  return EXCLUDE_FILES.includes(fileName);
}

/**
 * Determines if a .ts file should include its full content based on INCLUDE_FULL_TS_FILES.
 * @param filePath - The path of the .ts file to check.
 * @returns `true` if the file should include full content, otherwise `false`.
 */
function shouldIncludeFullTs(filePath: string): boolean {
  // Normalize paths for comparison
  const normalizedPath = filePath.replace(/\\/g, "/");
  return INCLUDE_FULL_TS_FILES.some((pattern) => {
    // Simple glob pattern matching (exact match or wildcard)
    if (pattern.endsWith("/*")) {
      const dir = pattern.slice(0, -2);
      return normalizedPath.startsWith(dir + "/");
    }
    return normalizedPath === pattern;
  });
}

/**
 * Extracts header comments from a .ts file.
 * Header comments include block comments at the top and single-line comments until the first non-comment line.
 * @param filePath - The path of the .ts file.
 * @returns The extracted header comments as a string.
 */
async function extractTsHeaderComments(filePath: string): Promise<string> {
  const file = await Deno.open(filePath, { read: true });
  const decoder = new TextDecoder("utf-8");
  const reader = file.readable.getReader();
  let inBlockComment = false;
  let headerComments = "";
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    if (readerDone) {
      break;
    }
    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (!inBlockComment) {
        if (/^\s*\/\*/.test(line)) {
          inBlockComment = true;
          headerComments += line + "\n";
          if (/\*\//.test(line)) {
            inBlockComment = false;
          }
        } else if (/^\s*\/\//.test(line)) {
          headerComments += line + "\n";
        } else if (headerComments.trim() === "") {
          // Skip leading non-comment lines
          done = true;
          break;
        } else {
          // First non-comment line after comments
          done = true;
          break;
        }
      } else {
        headerComments += line + "\n";
        if (/\*\//.test(line)) {
          inBlockComment = false;
        }
      }
    }
  }

  file.close();
  return headerComments.trim();
}

/**
 * Appends content to the output file with headers and footers.
 * @param content - The content to append.
 */
async function appendToOutput(content: string) {
  await Deno.writeTextFile(OUTPUT_FILE, content, { append: true });
}

console.log("Starting concatenation...");

// Initialize the output file
await Deno.writeTextFile(OUTPUT_FILE, "");

// Traverse the project directory
for await (const entry of walk(".", {
  skip: EXCLUDE_DIRS.map((dir) => new RegExp(`^${dir}(/|$)`)),
  includeFiles: true,
  includeDirs: false,
  followSymlinks: false,
})) {

  const filePath = `./${entry.path}`;
  const extension = entry.name.split(".").pop()?.toLowerCase();

  // Skip if extension is not in INCLUDE_EXTENSIONS
  if (!extension || !INCLUDE_EXTENSIONS.includes(extension)) {
    continue;
  }

  // Skip excluded files
  if (shouldExcludeFile(filePath)) {
    console.log(`Skipping ${filePath} (matches exclusion pattern)`);
    continue;
  } else {
    console.log(`Processing ${filePath}`);
  }

  // Add a header with the file name
  const header = `===== File: ${filePath} =====\n\n`;
  await appendToOutput(header);

  if (extension === "ts") {
    if (shouldIncludeFullTs(filePath)) {
      // Append the entire .ts file content
      try {
        const content = await Deno.readTextFile(filePath);
        await appendToOutput(content);
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        await appendToOutput("// Error reading file.\n");
      }
    } else {
      // Extract and append only header comments for .ts files
      try {
        const headerComments = await extractTsHeaderComments(filePath);
        if (headerComments) {
          await appendToOutput(headerComments);
        } else {
          await appendToOutput("// No header comments found.\n");
        }
      } catch (error) {
        console.error(`Error extracting comments from ${filePath}:`, error);
        await appendToOutput("// Error extracting header comments.\n");
      }
    }
  } else {
    // Append the entire file content for other file types
    try {
      const content = await Deno.readTextFile(filePath);
      await appendToOutput(content);
    } catch (error) {
      console.error(`Error reading ${filePath}:`, error);
      await appendToOutput("// Error reading file.\n");
    }
  }

  // Add a footer for separation
  const footer = `\n===========================\n\n`;
  await appendToOutput(footer);
}

console.log(`Concatenation complete. Output file created: ${OUTPUT_FILE}`);
