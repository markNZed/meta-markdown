/**
 * @module TruncateAndUpdateToc
 * 
 * This script reads a Markdown file, converts it to an Abstract Syntax Tree (AST),
 * truncates all text values to a maximum of 128 characters, sends the truncated AST
 * to a Language Model (LLM) to generate a new table of contents, and replaces the
 * existing table of contents with the updated one based on the LLM's commands.
 * 
 * The script leverages various utilities for file I/O, AST manipulation, LLM interaction,
 * and command execution to ensure consistency with the project's conventions and style.
 * 
 * @function main
 * @async
 * @description Orchestrates the process of reading, processing, and updating the Markdown file.
 * @throws Will throw an error if any step in the process fails, such as file reading/writing,
 * parsing, LLM interaction, or command execution.
 * 
 * @example
 * To execute the script, simply run it within the Deno environment:
 * 
 * ```bash
 * deno run --allow-read --allow-write --allow-net --import-map=import_map.json src/scripts/truncateAndUpdateToc.ts
 * ```
 */

import { readMarkdown, writeMarkdown } from '@/utils/markdown/fileIO.ts';
import { parseMarkdown, stringifyMarkdown } from '@/utils/markdown/markdown.ts';
import { executeCommands, CommandBatch } from '@/utils/markdown/commandExecutor.ts';
import { callOpenAI } from '@/utils/llm/llm.ts';
import { MarkdownNode } from '@/types/markdown.ts';
import logger from '@/utils/logger.ts';
import type { Root } from "npm:@types/mdast";


/**
 * Recursively traverses the Markdown AST and truncates all text node values to a specified maximum length.
 * 
 * @function truncateTextNodes
 * @param {MarkdownNode} node - The current AST node being traversed.
 * @param {number} maxLength - The maximum allowed length for text node values.
 */
function truncateTextNodes(node: MarkdownNode, maxLength: number): void {
  if (!node || typeof node !== 'object') return;

  if (node.type === 'text' && typeof node.value === 'string') {
    if (node.value.length > maxLength) {
      node.value = node.value.slice(0, maxLength);
    }
  }

  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      truncateTextNodes(child, maxLength);
    }
  }
}

/**
 * Generates a prompt for the LLM to create commands for updating the table of contents.
 * 
 * @function generatePrompt
 * @param {MarkdownNode} ast - The truncated Markdown AST.
 * @returns {string} - The formatted prompt to be sent to the LLM.
 */
function generatePrompt(ast: MarkdownNode): string {
  return `
You are provided with the Abstract Syntax Tree (AST) of a Markdown document. 
Please generate a set of commands in JSON format to replace the current table of contents with an updated one.

Here is the truncated AST:
${JSON.stringify(ast, null, 2)}

Provide the commands as a JSON object with a "commands" array. Each command should follow the schema defined in CommandBatch.
`;
}

/**
 * Parses the LLM's response and extracts the CommandBatch.
 * 
 * @function parseCommands
 * @param {string} response - The raw response from the LLM.
 * @returns {CommandBatch} - The parsed commands ready for execution.
 * @throws Will throw an error if the response cannot be parsed into a valid CommandBatch.
 */
function parseCommands(response: string): CommandBatch {
  try {
    const jsonStart = response.indexOf('{');
    const jsonString = response.substring(jsonStart);
    const commands: CommandBatch = JSON.parse(jsonString);
    if (!commands.commands || !Array.isArray(commands.commands)) {
      throw new Error('Invalid CommandBatch format.');
    }
    return commands;
  } catch (error) {
    logger.error('Failed to parse commands from LLM response:', error);
    throw new Error('Unable to parse commands from LLM response.');
  }
}

/**
 * The main function orchestrating the truncation and table of contents update process.
 * 
 * @async
 * @function main
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  const INPUT_FILE_PATH = './README.md'; // Adjust the input file path as needed
  const OUTPUT_FILE_PATH = './README_UPDATED.md'; // Adjust the output file path as needed
  const MAX_TEXT_LENGTH = 128;

  try {
    logger.info(`Reading Markdown file from: ${INPUT_FILE_PATH}`);
    const markdownContent = await readMarkdown(INPUT_FILE_PATH);

    logger.info('Parsing Markdown content to AST.');
    const ast = parseMarkdown(markdownContent) as MarkdownNode;

    logger.info(`Truncating all text nodes to a maximum of ${MAX_TEXT_LENGTH} characters.`);
    truncateTextNodes(ast, MAX_TEXT_LENGTH);

    logger.info('Generating prompt for LLM.');
    const prompt = generatePrompt(ast);

    logger.info('Sending prompt to LLM.');
    const llmResponse = await callOpenAI({
      prompt,
      requestId: 'truncateAndUpdateToc-' + Date.now(),
      configOverrides: {},
    });

    if (typeof llmResponse !== 'string') {
      throw new Error('Unexpected LLM response format.');
    }

    logger.info('Parsing commands from LLM response.');
    const commands = parseCommands(llmResponse);

    logger.info('Executing commands to update the table of contents.');
    executeCommands(ast, commands);

    logger.info('Stringifying the updated AST back to Markdown.');
    const updatedMarkdown = stringifyMarkdown(ast as Root);

    logger.info(`Writing the updated Markdown to: ${OUTPUT_FILE_PATH}`);
    await writeMarkdown(OUTPUT_FILE_PATH, updatedMarkdown);

    logger.info('Markdown file has been successfully updated.');
  } catch (error) {
    logger.critical('An error occurred during the truncation and TOC update process:', error);
    Deno.exit(1);
  }
}

// Invoke the main function
main();