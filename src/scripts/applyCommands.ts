// scripts/applyCommands.ts

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { readMarkdown, writeMarkdown } from '@/utils/markdown/fileIO.ts';
import { assignNodeIds } from '@/utils/markdown/idAssigner.ts';
import { executeCommands } from '@/utils/markdown/commandExecutor.ts';
import { callOpenAI } from '@/utils/llm/llm.ts';
import { CommandBatch } from '@/utils/markdown/commandSchema.ts';
import logger from '@/utils/logger.ts';
import { remark } from "remark";

/**
 * Main function to apply commands to a Markdown file.
 */
async function main() {
  const inputFilePath = 'input.md'; // Path to the input Markdown file
  const outputFilePath = 'output.md'; // Path to the output Markdown file

  try {
    // Step 1: Read the Markdown content
    const markdownContent = await readMarkdown(inputFilePath);
    logger.info(`Read Markdown content from ${inputFilePath}.`);

    // Step 2: Parse the Markdown into an AST
    const processor = unified().use(remarkParse);
    const ast = processor.parse(markdownContent) as any; // Using 'any' to accommodate custom properties
    logger.info(`Parsed Markdown content into AST.`);

    // Step 3: Assign unique IDs to each node in the AST
    assignNodeIds(ast);
    logger.info(`Assigned unique IDs to AST nodes.`);

    // Step 4: Generate a prompt to send to the LLM
    const prompt = `Given the following Markdown AST, provide JSON commands to insert a new heading "Summary" at the end of the document.\n\nAST:\n${JSON.stringify(ast, null, 2)}`;

    logger.debug(`Generated prompt for LLM: ${prompt}`);

    // Step 5: Call the OpenAI API to get JSON commands
    const llmResponse = await callOpenAI({ prompt }) as string;
    logger.info(`Received response from LLM.`);

    // Step 6: Parse the JSON commands
    let commandBatch: CommandBatch;
    try {
      commandBatch = JSON.parse(llmResponse);
      logger.debug(`Parsed JSON commands: ${JSON.stringify(commandBatch, null, 2)}`);
    } catch (error) {
      throw new Error(`Failed to parse LLM response as JSON: ${error}`);
    }

    // Step 7: Execute the commands on the AST
    executeCommands(ast, commandBatch);
    logger.info(`Executed JSON commands on AST.`);

    // Step 8: Stringify the modified AST back to Markdown
    const newMarkdownContent = remark().use(remarkStringify).stringify(ast);
    logger.info(`Converted modified AST back to Markdown.`);

    // Step 9: Write the updated Markdown content to the output file
    await writeMarkdown(outputFilePath, newMarkdownContent);
    logger.info(`Wrote updated Markdown content to ${outputFilePath}.`);
  } catch (error) {
    logger.error(`Error in applyCommands.ts: ${error}`);
  }
}

main();
