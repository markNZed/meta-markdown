/**
 * This module provides functionality to read a Markdown file, generate a glossary from its content,
 * and write the updated content back to a new Markdown file.
 *
 * @module MarkdownGlossary
 * 
 * @async
 * @function main
 * 
 * @description The main function reads an example Markdown file named 'example.md', generates a glossary
 * based on its content, appends the glossary to the original content, and writes the resulting content
 * to 'example_with_glossary_and_index.md'.
 * 
 * @example
 * // Execute the main function to process the Markdown file
 * main();
 * 
 * @returns {Promise<void>} A promise that resolves when the Markdown file has been updated successfully.
 
 * @hash 2a84dc77ee3da8ec247f6adbb9482cfddddcc8044a3b796955c37119a1b361f5
 */

import { readMarkdown, writeMarkdown } from '@/utils/markdown/fileIO.ts';
import { generateGlossary } from '@/utils/markdown/glossary.ts';

const requestId = `glossary-index-${Date.now()}`;

const main = async () => {
  const filePath = 'example.md';
  const content = await readMarkdown(filePath);

  const glossary = await generateGlossary(content, requestId);

  // Append glossary and index to the markdown content
  const updatedContent = `${content}\n\n## Glossary\n${glossary}\n`;

  await writeMarkdown('example_with_glossary_and_index.md', updatedContent);
};

main();
