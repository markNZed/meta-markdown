/**
 * Processes markdown files by applying specified transformations to their abstract syntax trees (ASTs).
 *
 * @param {string | string[]} filePathsOrPatterns - A single file path, an array of file paths, or glob patterns to identify markdown files to process.
 * @param {MarkdownProcessor | MarkdownProcessor[]} processFunctions - A single function or an array of functions to process the markdown AST. Each function can modify the AST in place and may return a promise for asynchronous operations.
 *
 * The `processMarkdownFiles` function reads markdown files, parses them into ASTs, applies the provided processing functions to modify the ASTs, and writes the modified content back to the files. It handles both single and multiple file paths, as well as glob patterns for file selection.
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
