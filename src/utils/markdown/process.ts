/**
 * @module Markdown Processing
 * 
 * This module provides a function to process Markdown files by applying specified processing functions to their Abstract Syntax Tree (AST).
 * 
 * @function processMarkdownFiles
 * @param {string | string[]} filePathsOrPatterns - A single file path or an array of file paths or glob patterns to locate the Markdown files to process.
 * @param {MarkdownProcessor | MarkdownProcessor[]} processFunctions - A single processing function or an array of processing functions that will be applied to the AST of each Markdown file. Each function receives the AST as an argument and can return either void or a Promise that resolves to void.
 * 
 * @example
 * // Define a processing function
 * const exampleProcessor: MarkdownProcessor = async (ast) => {
 *   // Modify the AST here
 * };
 * 
 * // Process a single file
 * await processMarkdownFiles('path/to/file.md', exampleProcessor);
 * 
 * // Process multiple files with an array of functions
 * await processMarkdownFiles(['path/to/*.md', 'another/path/*.md'], [exampleProcessor, anotherProcessor]);
 */

import { readMarkdown, writeMarkdown } from './fileIO.ts';
import { parseMarkdownToAST, stringifyMarkdown } from './markdown.ts';
import { MarkdownNode } from '../../types/markdown.ts';
import type { Root } from "npm:@types/mdast";
import { getFilePaths } from '../file.ts';

type MarkdownProcessor = (ast: MarkdownNode) => void | Promise<void>;

export const processMarkdownFiles = async (
  filePathsOrPatterns: string | string[],
  processFunctions: MarkdownProcessor | MarkdownProcessor[],
) => {
  const processors = Array.isArray(processFunctions) ? processFunctions : [processFunctions];

  const filePaths = await getFilePaths(filePathsOrPatterns);

  for (const filePath of filePaths) {
    try {
      const content = await readMarkdown(filePath);
      const ast = parseMarkdownToAST(content);

      for (const processFunction of processors) {
        await processFunction(ast);
      }

      const updatedContent = stringifyMarkdown(ast as Root); // Cast ast to Root type
      await writeMarkdown(filePath, updatedContent);
    } catch (error) {
      console.error(`Error processing file ${filePath}: ${(error as Error).message}`);
    }
  }
}
