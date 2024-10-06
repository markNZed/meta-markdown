/**
 * @module RewriteForAudience
 * 
 * This module provides a function to rewrite markdown content for a specific audience using OpenAI's language model.
 * 
 * @function rewriteForAudience
 * @param {string} markdownContent - The markdown content to be rewritten.
 * @param {string} audience - The target audience for whom the content should be tailored.
 * @param {string} requestId - A unique identifier for the request, used for tracking purposes.
 * @returns {Promise<string>} A promise that resolves to the rewritten markdown content suitable for the specified audience.
 * 
 * @example
 * const rewrittenContent = await rewriteForAudience("# Hello World", "children", "12345");
 * console.log(rewrittenContent); // Outputs the rewritten content tailored for children.
 */

import { callOpenAI } from '../llm/llm.ts';

export const rewriteForAudience = async (markdownContent: string, audience: string, requestId: string): Promise<string> => {
  const prompt = `Rewrite the following markdown content to be suitable for ${audience}:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};
