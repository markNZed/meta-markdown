/**
 * @module GlossaryGenerator
 * 
 * This module provides functions to generate a glossary from markdown content by extracting key terms 
 * and their definitions using OpenAI's language model.
 * 
 * @function generateGlossary
 * @param {string} markdownContent - The markdown content from which to extract key terms.
 * @param {string} requestId - A unique identifier for the request, used for tracking.
 * @returns {Promise<string>} A promise that resolves to a string containing the generated glossary.
 * 
 * @example
 * const glossary = await generateGlossary('# Sample Title\n\nThis is some sample markdown content.', 'req-12345');
 * console.log(glossary);
 */

import { parseMarkdown, stringifyMarkdown } from './markdown.ts';
import { callOpenAI } from '../llm/llm.ts';

export const generateGlossary = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `Extract key terms from the following markdown content and provide a glossary with definitions:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};
