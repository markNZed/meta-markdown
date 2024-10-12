/**
 * @module RewriteForAudience
 * 
 * This module provides a function to rewrite markdown content for a specific audience using OpenAI's language model.
 * 
 * @function rewriteForAudience
 * 
 * @param {string} markdownContent - The markdown content to be rewritten.
 * @param {string} audience - The target audience for the rewritten content.
 * @param {string} requestId - A unique identifier for the request, used for tracking purposes.
 * 
 * @returns {Promise<string>} A promise that resolves to the rewritten markdown content suitable for the specified audience.
 * 
 * @example
 * const audience = 'children';
 * const requestId = '12345';
 * const content = '# Welcome\nThis is a test.';
 * 
 * rewriteForAudience(content, audience, requestId)
 *   .then(rewrittenContent => {
 *     console.log(rewrittenContent);
 *   })
 *   .catch(error => {
 *     console.error('Error rewriting content:', error);
 *   });
 
 * @hash 92915a8cd44941d1f28467e13fc71a1844a0f2c03d0852c74caea2fc45d1de39
 */

import { callOpenAI } from '../llm/llm.ts';

export const rewriteForAudience = async (markdownContent: string, audience: string, requestId: string): Promise<string> => {
  const prompt = `Rewrite the following markdown content to be suitable for ${audience}:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};
