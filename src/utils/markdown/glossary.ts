/**
 * @module GlossaryGenerator
 * 
 * This module provides functions for generating a glossary from markdown content.
 * 
 * @function generateGlossary
 * @param {string} markdownContent - The markdown content from which to extract key terms.
 * @param {string} requestId - A unique identifier for the request, used for tracking purposes.
 * @returns {Promise<string>} A promise that resolves to a string containing the generated glossary.
 * 
 * @example
 * const glossary = await generateGlossary("# Example\n\nThis is an example markdown.", "req-123");
 * console.log(glossary); // Outputs the glossary extracted from the provided markdown content.
 
 * @hash 23ba81fe7eeabe6ae3e3134d8bda91243d5777822ff18467ad1ab9b9ad308072
 */

import { parseMarkdown, stringifyMarkdown } from './markdown.ts';
import { callOpenAI } from '../llm/llm.ts';

export const generateGlossary = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `Extract key terms from the following markdown content and provide a glossary with definitions:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};
