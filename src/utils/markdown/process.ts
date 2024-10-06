/**
 * Processes Markdown files by applying a series of transformations to their Abstract Syntax Trees (AST).
 * 
 * @param filePathsOrPatterns - A single file path, an array of file paths, or glob patterns specifying the Markdown files to process.
 * @param processFunctions - A single function or an array of functions that take a MarkdownNode and may return a promise. Each function is applied to the AST of each Markdown file.
 * 
 * This function reads the specified Markdown files, parses them into an AST, applies each provided processing function to the AST, and then writes the updated content back to the files.
 * 
 * The processing functions can be synchronous or asynchronous, allowing for flexible transformation logic.
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
