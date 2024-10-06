/**
 * This module rewrites the content of a Markdown file for a specified target audience.
 * 
 * It imports utility functions to read from and write to Markdown files, and to rewrite
 * the content based on the audience's needs. The main process involves reading the content
 * from a Markdown file, processing it with the target audience in mind, and saving the 
 * rewritten content to a new Markdown file.
 * 
 * Usage:
 * 1. Ensure that the input Markdown file (e.g., 'example.md') exists in the working directory.
 * 2. Call the `main` function to execute the rewriting process. The rewritten content will 
 *    be saved as 'example_rewritten.md'.
 * 
 * The `requestId` is generated dynamically and is used to uniquely identify the rewriting 
 * request.
 */

import { readMarkdown, writeMarkdown } from '@/utils/markdown/fileIO.ts';
import { rewriteForAudience } from '@/utils/markdown/rewriter.ts';

const requestId = `rewrite-${Date.now()}`;

const main = async () => {
  const filePath = 'example.md';
  const content = await readMarkdown(filePath);
  const targetAudience = 'high school students';

  const rewrittenContent = await rewriteForAudience(content, targetAudience, requestId);

  await writeMarkdown('example_rewritten.md', rewrittenContent);
};

main();
