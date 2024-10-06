/**
 * Provides functions to generate a glossary from markdown content.
 *
 * @function generateGlossary
 * @param {string} markdownContent - The markdown content from which to extract key terms and definitions.
 * @param {string} requestId - A unique identifier for the request, used for tracking purposes.
 * @returns {Promise<string>} A promise that resolves to a glossary string with definitions of key terms extracted from the markdown content.
 *
 * This function uses the OpenAI API to analyze the given markdown content and extract key terms to create a glossary.
 */

import { parseMarkdown, stringifyMarkdown } from './markdown.ts';
import { callOpenAI } from '../llm/llm.ts';

export const generateGlossary = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `Extract key terms from the following markdown content and provide a glossary with definitions:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};
