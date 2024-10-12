/**
 * @module MarkdownRewriter
 * 
 * This module provides functionality to read a markdown file, rewrite its content for a specific audience,
 * and write the rewritten content to a new markdown file.
 *
 * @function main
 * 
 * The `main` function orchestrates the process of reading a markdown file, 
 * rewriting its content for a specified audience, and saving the result to a new file.
 * 
 * Usage:
 * 1. Ensure you have a markdown file named 'example.md' in the same directory.
 * 2. Adjust the `targetAudience` variable to the desired audience (e.g., 'high school students').
 * 3. Run the script. It will read 'example.md', rewrite the content, and save it as 'example_rewritten.md'.
 * 
 * Note: The `requestId` is automatically generated based on the current timestamp to ensure uniqueness 
 * in rewriting requests.
 
 * @hash ae4d43c5ec453adee459d2322cc98cb8b37019ad097f2b3938ae88506605863b
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
