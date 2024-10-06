/**
 * This module provides utility functions for handling Markdown files, including reading,
 * writing, and formatting. It utilizes the Deno runtime for file operations and the remark
 * library for Markdown processing.
 *
 * Exported Functions:
 * 
 * - `readMarkdown(filePath: string): Promise<string>`: Reads the content of a Markdown file
 *   specified by `filePath` and returns it as a string. Throws an error if the file cannot be read.
 *
 * - `writeMarkdown(filePath: string, content: string): Promise<void>`: Writes the specified
 *   `content` to a Markdown file at `filePath`. Ensures the directory exists and throws an error
 *   if the file cannot be written.
 *
 * - `formatMarkdown(filePath: string): Promise<void>`: Formats the Markdown file at `filePath`
 *   using remark with preset linting and stringification rules. Throws an error if formatting fails.
 */

import { remark } from "npm:remark";
import presetLintRecommended from "npm:remark-preset-lint-recommended";
import remarkStringify from "npm:remark-stringify";
import { config } from '@/config.ts';


const markdownDir = config.markdownDir;

// Support for __dirname in ESM
import { fileURLToPath } from "node:url";
import { resolve, dirname } from '@std/path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Reads a Markdown file and returns its content as a string.
 *
 * @param {string} filePath - The relative path to the Markdown file.
 * @returns {Promise<string>} - The content of the Markdown file.
 * @throws Will throw an error if the file cannot be read and is not found.
 */
export const readMarkdown = async (filePath: string): Promise<string> => {
  try {
    // Resolve the absolute path to the Markdown file
    const absolutePath = resolve(markdownDir, filePath);
    console.log(`Attempting to read Markdown file at: ${absolutePath}`);

    // Read the file content as text
    const data = await Deno.readTextFile(absolutePath);
    return data;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.warn(`Warning: Markdown file not found at: ${filePath}`);
      return ""; // Return an empty string or handle it as needed
    } else {
      throw new Error(`Failed to read Markdown file: ${error}`);
    }
  }
};

/**
 * Writes content to a Markdown file at the specified path.
 *
 * @param {string} filePath - The relative path to the Markdown file.
 * @param {string} content - The content to write to the Markdown file.
 * @returns {Promise<void>}
 * @throws Will throw an error if the file cannot be written.
 */
export const writeMarkdown = async (
  filePath: string,
  content: string,
): Promise<void> => {
  try {
    // Resolve the absolute path where the Markdown file will be written
    const absolutePath = resolve(markdownDir, filePath);

    // Ensure the directory exists
    const dir = dirname(absolutePath);
    await Deno.mkdir(dir, { recursive: true });

    // Write the content to the file as text
    await Deno.writeTextFile(absolutePath, content);
    console.log(`Successfully wrote to Markdown file at: ${absolutePath}`);
  } catch (error) {
    throw new Error(`Failed to write Markdown file: ${error}`);
  }
};

/**
 * Formats a Markdown file using remark with preset linting and stringification.
 *
 * @param {string} filePath - The relative path to the Markdown file.
 * @returns {Promise<void>}
 * @throws Will throw an error if the Markdown cannot be formatted.
 */
export const formatMarkdown = async (filePath: string): Promise<void> => {
  try {
    // Read the current content of the Markdown file
    const content = await readMarkdown(filePath);
    if (!content) {
      console.warn("Cannot format empty content");
      return;
    }

    // Use remark to process and format the markdown
    const formatted = await remark()
      .use(presetLintRecommended) // Linting and formatting rules
      .use(remarkStringify) // Stringify back to markdown
      .process(content);

    // Write the formatted content back to the Markdown file
    await writeMarkdown(filePath, formatted.toString());
    console.log("Markdown file formatted successfully.");
  } catch (error) {
    throw new Error(`Failed to format Markdown: ${error}`);
  }
};
