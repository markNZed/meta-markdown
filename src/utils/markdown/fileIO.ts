/**
 * A module for reading, writing, and formatting Markdown files.
 *
 * @module MarkdownFileHandler
 * 
 * @function readMarkdown
 * @param {string} filePath - The relative path to the Markdown file to read.
 * @returns {Promise<string>} - A promise that resolves to the content of the Markdown file as a string. 
 * @throws Will throw an error if the file cannot be read or is not found.
 * 
 * @function writeMarkdown
 * @param {string} filePath - The relative path to the Markdown file to write to.
 * @param {string} content - The content to write to the Markdown file.
 * @returns {Promise<void>} - A promise that resolves when the content has been written.
 * @throws Will throw an error if the file cannot be written.
 * 
 * @function formatMarkdown
 * @param {string} filePath - The relative path to the Markdown file to format.
 * @returns {Promise<void>} - A promise that resolves when the Markdown file has been formatted.
 * @throws Will throw an error if the Markdown cannot be formatted.
 * 
 * @example
 * // Example usage:
 * const content = await readMarkdown('example.md');
 * await writeMarkdown('example.md', '# New Content');
 * await formatMarkdown('example.md');
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
