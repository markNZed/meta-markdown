import { readMarkdown, writeMarkdown } from './fileIO.ts';
import { parseMarkdownToAST, stringifyMarkdown } from './markdown.ts';
import { MarkdownNode } from '../../types/markdown.ts';
import { resolve } from "https://deno.land/std/path/mod.ts";
import { walk, expandGlob } from "https://deno.land/std/fs/mod.ts";
import type { Root } from "npm:@types/mdast";

type MarkdownProcessor = (ast: MarkdownNode) => void | Promise<void>;

const getFilePaths = async (input: string | string[]): Promise<string[]> => {
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
