/**
 * @module MarkdownProcessor
 * 
 * This module provides functions to create and manipulate Markdown Abstract Syntax Trees (ASTs).
 * 
 * @function createHeading Creates a heading node of a specific depth with the given text.
 * @param {1 | 2 | 3 | 4 | 5 | 6} depth - The depth of the heading (1 to 6).
 * @param {string} text - The text content of the heading.
 * @returns {Heading} A Heading node.
 * @throws {Error} Will throw an error if the depth is not between 1 and 6.
 * 
 * @function createParagraph Creates a paragraph node with the given text.
 * @param {string} text - The text content of the paragraph.
 * @returns {Paragraph} A Paragraph node.
 * 
 * @function parseMarkdown Parses Markdown content into an AST of type Root.
 * @param {string} markdownContent - The Markdown content as a string.
 * @returns {Root} The Root AST node.
 * 
 * @function stringifyMarkdown Converts an AST of type Root back into a Markdown string.
 * @param {Root} ast - The Root AST node.
 * @returns {string} The Markdown content as a string.
 * 
 * @function insertHeading Inserts a heading node into the AST at the specified position.
 * @param {Root} ast - The Root AST node.
 * @param {Heading} headingNode - The Heading node to insert.
 * @param {number} position - The index position to insert the heading.
 * 
 * @function summarizeContentAI Summarizes the content of the AST using AI.
 * @param {Root} ast - The Root AST node.
 * @param {string} requestId - The unique request identifier for logging.
 * @returns {Promise<string>} A Promise that resolves to the summary string.
 * 
 * @function improveStyleAI Improves the style of the AST content using AI.
 * @param {Root} ast - The Root AST node.
 * @param {string} requestId - The unique request identifier for logging.
 * @returns {Promise<Root>} A Promise that resolves to the improved Root AST node.
 * 
 * @function checkGrammarAI Checks and corrects grammar in the AST content using AI.
 * @param {Root} ast - The Root AST node.
 * @param {string} requestId - The unique request identifier for logging.
 * @returns {Promise<Root>} A Promise that resolves to the grammatically corrected Root AST node.
 * 
 * @function parseMarkdownToAST Parses Markdown content into a MarkdownNode type AST.
 * @param {string} markdownContent - The Markdown content as a string.
 * @returns {MarkdownNode} The parsed MarkdownNode AST.
 * 
 * @function addTimestamp Adds a timestamp paragraph node indicating the last updated time to the AST.
 * @param {MarkdownNode} ast - The Markdown AST node to which the timestamp will be added.
 * @param {'start' | 'end'} [position='start'] - The position where the timestamp should be added ('start' or 'end').
 
 * @hash e4549613a6f9fd0d63aeb8f448b7c685aee93c805a8e500760063834b4003b2b
 */

import {unified} from 'unified';
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import type { Root, Heading, Paragraph, Text } from "npm:@types/mdast";
import type { Node } from "npm:unist";
import { callOpenAI } from '../llm/llm.ts';
import logger from '../logger.ts';
import { MarkdownNode } from '@/types/markdown.ts';
import { generateUniqueId } from './helpers.ts';


/**
 * Defines a Processor instance with Root as input and string as output.
 */
// Initialize the processor with explicit types
// Initialize the processor without unnecessary casts
const processor = unified()
  .use(remarkParse)  // TypeScript should correctly infer the types here
  .use(remarkStringify);  // If TypeScript complains, cast to `unknown`


/**
 * Creates a heading node of a specific depth with the given text.
 *
 * @param depth - The depth of the heading (1 to 6).
 * @param text - The text content of the heading.
 * @returns A Heading node.
 * @throws Will throw an error if the depth is not between 1 and 6.
 */
export const createHeading = (depth: 1 | 2 | 3 | 4 | 5 | 6, text: string): Heading => {
  if (depth < 1 || depth > 6) {
    throw new Error('Invalid heading depth. Must be an integer between 1 and 6.');
  }

  const heading: Heading = {
    type: 'heading',
    depth,
    children: [
      {
        type: 'text',
        value: text,
      } as Text,
    ],
  };

  return heading;
};

/**
 * Creates a paragraph node with the given text.
 *
 * @param text - The text content of the paragraph.
 * @returns A Paragraph node.
 */
export const createParagraph = (text: string): Paragraph => {
  const paragraph: Paragraph = {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value: text,
      } as Text,
    ],
  };

  return paragraph;
};

/**
 * Parses Markdown content into an AST of type Root.
 *
 * @param markdownContent - The Markdown content as a string.
 * @returns The Root AST node.
 */
export const parseMarkdown = (markdownContent: string): Root => {
  const file = unified().use(remarkParse).parse(markdownContent);
  return file as Root;
};

/**
 * Converts an AST of type Root back into a Markdown string.
 *
 * @param ast - The Root AST node.
 * @returns The Markdown content as a string.
 */
export const stringifyMarkdown = (ast: Root): string => {
  return processor.stringify(ast as Node);
};

/**
 * Inserts a heading node into the AST at the specified position.
 *
 * @param ast - The Root AST node.
 * @param headingNode - The Heading node to insert.
 * @param position - The index position to insert the heading.
 */
export const insertHeading = (ast: Root, headingNode: Heading, position: number): void => {
  if (ast.children && Array.isArray(ast.children)) {
    ast.children.splice(position, 0, headingNode);
    logger.info(`Inserted heading at position ${position}.`, { requestId: 'markdown' });
  } else {
    logger.warning('AST does not have a children array. Cannot insert heading.', { requestId: 'markdown' });
  }
};

/**
 * Summarizes the content of the AST using AI.
 *
 * @param ast - The Root AST node.
 * @param requestId - The unique request identifier for logging.
 * @returns A Promise that resolves to the summary string.
 */
export const summarizeContentAI = async (ast: Root, requestId: string): Promise<string> => {
  try {
    const markdown = stringifyMarkdown(ast);
    const prompt = `Please provide a concise summary of the following Markdown content:\n\n${markdown}`;
    const summary = await callOpenAI({ prompt, requestId });
    return summary as string;
  } catch (error: any) {
    logger.error('Error during content summarization.', { requestId, error: error.message });
    throw error;
  }
};

/**
 * Improves the style of the AST content using AI.
 *
 * @param ast - The Root AST node.
 * @param requestId - The unique request identifier for logging.
 * @returns A Promise that resolves to the improved Root AST node.
 */
export const improveStyleAI = async (ast: Root, requestId: string): Promise<Root> => {
  try {
    const markdown = stringifyMarkdown(ast);
    const prompt = `Please review the following Markdown content for style improvements and provide a revised version:\n\n${markdown}`;
    const improvedMarkdown = await callOpenAI({ prompt, requestId }) as string;
    const improvedAst = parseMarkdown(improvedMarkdown);
    return improvedAst;
  } catch (error: any) {
    logger.error('Error during style improvement.', { requestId, error: error.message });
    throw error;
  }
};

/**
 * Checks and corrects grammar in the AST content using AI.
 *
 * @param ast - The Root AST node.
 * @param requestId - The unique request identifier for logging.
 * @returns A Promise that resolves to the grammatically corrected Root AST node.
 */
export const checkGrammarAI = async (ast: Root, requestId: string): Promise<Root> => {
  try {
    const markdown = stringifyMarkdown(ast);
    const prompt = `Please review the following Markdown content for grammatical errors and provide a corrected version:\n\n${markdown}`;
    const correctedMarkdown = await callOpenAI({ prompt, requestId }) as string;
    const correctedAst = parseMarkdown(correctedMarkdown);
    return correctedAst;
  } catch (error: any) {
    logger.error('Error during grammar checking.', { requestId, error: error.message });
    throw error;
  }
};

export const parseMarkdownToAST = (markdownContent: string): MarkdownNode => {
  const tree = unified().use(remarkParse).parse(markdownContent);
  return tree as MarkdownNode;
};


/**
 * Adds a timestamp paragraph node indicating the last updated time to the AST.
 *
 * @param ast - The Markdown AST node to which the timestamp will be added.
 * @param position - The position where the timestamp should be added ('start' or 'end'). Defaults to 'start'.
 */
export const addTimestamp = (ast: MarkdownNode, position: 'start' | 'end' = 'start'): void => {
  // Generate unique IDs for the new nodes
  const timestampParagraphId = generateUniqueId();
  const timestampTextId = generateUniqueId();

  // Create the timestamp text node with a unique ID
  const timestampTextNode: MarkdownNode = {
    type: 'text',
    value: `Last updated on ${new Date().toLocaleString()}`,
    id: timestampTextId,
  };

  // Create the timestamp paragraph node with a unique ID and the text child
  const timestampNode: MarkdownNode = {
    type: 'paragraph',
    children: [timestampTextNode],
    id: timestampParagraphId,
  };

  // Ensure the AST has a children array
  if (!ast.children || !Array.isArray(ast.children)) {
    ast.children = [];
  }

  // Insert the timestamp node at the specified position
  if (position === 'start') {
    ast.children.unshift(timestampNode);
    logger.info(`Added timestamp node ${timestampParagraphId} at the start of the AST.`);
  } else if (position === 'end') {
    ast.children.push(timestampNode);
    logger.info(`Added timestamp node ${timestampParagraphId} at the end of the AST.`);
  } else {
    logger.warning(`Invalid position '${position}' specified for addTimestamp. Defaulting to 'start'.`);
    ast.children.unshift(timestampNode);
    logger.info(`Added timestamp node ${timestampParagraphId} at the start of the AST.`);
  }
};
