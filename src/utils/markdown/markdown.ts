// src/utils/markdown.ts

import {unified} from "npm:unified";
import remarkParse from "npm:remark-parse";
import remarkStringify from "npm:remark-stringify";
import type { Root, Heading, Paragraph, Text } from "npm:@types/mdast";
import type { Node } from "npm:unist";
import { callOpenAI } from '../llm/llm.ts';
import logger from '../logger.ts';
import { readMarkdown, writeMarkdown } from './fileIO.ts';


/**
 * Defines a Processor instance with Root as input and string as output.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkStringify);

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
    const summary = await callOpenAI(prompt, requestId);
    return summary;
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
    const improvedMarkdown = await callOpenAI(prompt, requestId);
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
    const correctedMarkdown = await callOpenAI(prompt, requestId);
    const correctedAst = parseMarkdown(correctedMarkdown);
    return correctedAst;
  } catch (error: any) {
    logger.error('Error during grammar checking.', { requestId, error: error.message });
    throw error;
  }
};

import { MarkdownNode } from '../../types/markdown.ts';

export const parseMarkdownToAST = (markdownContent: string): MarkdownNode => {
  const tree = unified().use(remarkParse).parse(markdownContent);
  return tree as MarkdownNode;
};

export const addTimestamp = (ast: MarkdownNode) => {
    const timestampNode: MarkdownNode = {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: `Last updated on ${new Date().toLocaleString()}`,
        },
      ],
    };

    if (!ast.children) {
        ast.children = []; // Initialize as an empty array if undefined
    }
  
    ast.children.unshift(timestampNode);
};