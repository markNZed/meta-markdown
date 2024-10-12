/**
 * @module MarkdownProcessor
 * 
 * This module provides functions to process Markdown files using specified processing functions.
 * 
 * @function processMarkdownFiles
 * 
 * @param {string | string[]} filePathsOrPatterns - A file path or an array of file paths/patterns to Markdown files that you want to process.
 * @param {MarkdownProcessor | MarkdownProcessor[]} processFunctions - A single processing function or an array of processing functions to apply to the parsed Markdown AST.
 * 
 * @example
 * 
 * import { processMarkdownFiles } from '@/path/to/your/module';
 * 
 * const myProcessor = async (ast) => {
 *   // Modify the ast as needed
 * };
 * 
 * await processMarkdownFiles('src/docs/*.md', myProcessor);
 * 
 * This will read all Markdown files matching the pattern, parse them into ASTs, apply the processing function(s) to each AST, and then write the modified content back to the files.
 
 * @hash 53a3f5801abe8afa52391d9eeb6449641f7e87dd8acf15611154efbf1a3e1be0
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
