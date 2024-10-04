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
