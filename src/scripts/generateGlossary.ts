/**
 * @module GlossaryGenerator
 * 
 * This module provides functionality to read a Markdown file, generate a glossary from its content,
 * and write the updated content back to a new Markdown file.
 * 
 * @example
 * To use the functions in this module, ensure you have an 'example.md' file in the same directory.
 * 
 * 1. Call the `main` function to read the Markdown file, generate a glossary, 
 *    and write the updated content to 'example_with_glossary_and_index.md'.
 * 
 * The process will automatically append the generated glossary at the end of the original content.
 * 
 * @async
 * @function main
 * @returns {Promise<void>} A promise that resolves when the Markdown file has been processed.
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
