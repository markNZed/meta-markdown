/**
 * @module MarkdownDemo
 * 
 * This module demonstrates Markdown manipulation using various utility functions.
 * 
 * @function main
 * @async
 * @description 
 * The main function orchestrates the reading, parsing, enhancing, and writing of 
 * Markdown content. It performs the following steps:
 * 1. Reads a Markdown file from the specified path.
 * 2. Parses the content into an Abstract Syntax Tree (AST).
 * 3. Inserts a new heading into the AST.
 * 4. Generates a summary of the content using AI.
 * 5. Improves the style of the generated summary using AI.
 * 6. Checks the grammar of the summary using AI.
 * 7. Converts the modified AST back to Markdown format.
 * 8. Writes the enhanced Markdown content to a new file.
 * 
 * @example
 * To execute the demo, simply call the main function:
 * 
 * ```typescript
 * main();
 * ```
 * 
 * Ensure the necessary dependencies are installed and the utility functions 
 * are correctly imported from '@/utils/markdown/fileIO.ts' and 
 * '@/utils/markdown/markdown.ts'.
 
 * @hash 6df3f6443dc4d2d2a94d18669eb42f962c19e98b9569d9cbb8be4c8c53b72234
 */

import { readMarkdown, writeMarkdown } from '@/utils/markdown/fileIO.ts';
import {
    createHeading,
    createParagraph,
    parseMarkdown,
    stringifyMarkdown,
    insertHeading,
    summarizeContentAI,
    improveStyleAI,
    checkGrammarAI,
  } from '@/utils/markdown/markdown.ts';
import logger from '@/utils/logger.ts';
import type { Root, Paragraph } from "npm:@types/mdast";

// Unique identifier for logging (could be a UUID or timestamp)
const requestId = `demo-${Date.now()}`;

/**
 * Main function to demonstrate Markdown manipulation.
 */
const main = async () => {
  try {
    logger.info('Demo script started.', { requestId });
    logger.debug('Initializing variables and configurations.', { requestId });

    // Step 1: Read the original Markdown file
    const filePath = 'HumanistProcessPhilosophy.md';
    logger.info(`Reading Markdown file: ${filePath}`, { requestId });
    logger.debug(`Attempting to read file from path: ${filePath}`, { requestId });
    const markdownContent = await readMarkdown(filePath);
    
    if (!markdownContent) {
      logger.warning(`No content found in ${filePath}. Exiting demo.`, { requestId });
      return;
    }
    
    logger.debug(`Read content from file: ${filePath}, Content length: ${markdownContent.length}`, { requestId });

    // Step 2: Parse the Markdown content into AST
    logger.info('Parsing Markdown content into AST.', { requestId });
    logger.debug('Attempting to parse Markdown content.', { requestId });
    const ast = parseMarkdown(markdownContent);
    logger.debug('Successfully parsed Markdown into AST. AST structure:', { requestId, ast: JSON.stringify(ast) });

    // Step 3: Insert a new heading into the AST
    const newHeading = createHeading(2, 'Automated Enhancements');
    logger.info('Inserting new heading into AST.', { requestId });
    logger.debug(`Created new heading node: ${JSON.stringify(newHeading)}`, { requestId });
    insertHeading(ast, newHeading, 2); // Insert at position 2
    logger.debug('New heading successfully inserted at position 2 in AST.', { requestId });

    // Step 4: Summarize the content using AI
    logger.info('Generating summary of the document.', { requestId });
    logger.debug('Calling summarizeContentAI function.', { requestId, ast: JSON.stringify(ast) });
    const summary = await summarizeContentAI(ast, requestId);
    logger.debug(`Summary generated by AI: ${summary}`, { requestId });
    
    // Insert the summary into the AST
    const summaryHeading = createHeading(2, 'Summary');
    const summaryParagraph = createParagraph(summary);
    logger.debug(`Created summary heading and paragraph nodes: ${JSON.stringify({ summaryHeading, summaryParagraph })}`, { requestId });
    insertHeading(ast, summaryHeading, 3);
    ast.children.splice(3, 0, summaryParagraph);
    logger.debug('Inserted summary heading and paragraph into AST at position 3.', { requestId });

    // Step 5: Improve the style of the summary using AI
    logger.info('Improving style of the summary.', { requestId });
    const tempAstForStyleImprovement: Root = {
      type: 'root',
      children: [summaryParagraph],
    };
    logger.debug(`Created temporary AST for style improvement: ${JSON.stringify(tempAstForStyleImprovement)}`, { requestId });
    const improvedTempAst = await improveStyleAI(tempAstForStyleImprovement, requestId);
    logger.debug(`Improved AST returned by AI: ${JSON.stringify(improvedTempAst)}`, { requestId });
    const improvedParagraph = improvedTempAst.children[0] as Paragraph;
    logger.debug(`Extracted improved paragraph: ${JSON.stringify(improvedParagraph)}`, { requestId });
    ast.children[3] = improvedParagraph;
    logger.debug('Replaced original summary paragraph with improved paragraph in AST.', { requestId });

    // Step 6: Perform grammar check using AI
    logger.info('Checking grammar of the summary.', { requestId });
    const tempAstForGrammarImprovement: Root = {
      type: 'root',
      children: [improvedParagraph],
    };
    logger.debug(`Created temporary AST for grammar improvement: ${JSON.stringify(tempAstForGrammarImprovement)}`, { requestId });
    const grammaticallyCorrectAst = await checkGrammarAI(tempAstForGrammarImprovement, requestId);
    logger.debug(`Grammatically corrected AST returned by AI: ${JSON.stringify(grammaticallyCorrectAst)}`, { requestId });
    ast.children[3] = grammaticallyCorrectAst.children[0] as Paragraph;
    logger.debug('Replaced improved paragraph with grammatically corrected paragraph in AST.', { requestId });

    // Step 7: Stringify the AST back to Markdown
    logger.info('Converting AST back to Markdown.', { requestId });
    logger.debug('Stringifying AST into Markdown format.', { requestId });
    const finalMarkdown = stringifyMarkdown(ast);
    logger.debug(`Successfully stringified AST. Final Markdown content length: ${finalMarkdown.length}`, { requestId });

    // Step 8: Write the enhanced Markdown to a new file
    const outputFilePath = 'HumanistProcessPhilosophy_Summary.md';
    logger.info(`Writing enhanced Markdown to file: ${outputFilePath}`, { requestId });
    logger.debug(`Attempting to write content to file: ${outputFilePath}`, { requestId });
    await writeMarkdown(outputFilePath, finalMarkdown);
    logger.debug(`Successfully wrote enhanced Markdown to file: ${outputFilePath}`, { requestId });

    logger.info('Demo script completed successfully.', { requestId });
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('An error occurred during the demo script execution.', { requestId, error: msg });
    logger.debug('Full error stack trace:', { requestId, error: error.stack });
  }
};

// Execute the main function
main();
