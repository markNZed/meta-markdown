/**
 * This module exports a function to rewrite markdown content for a specific audience using OpenAI's language model.
 *
 * @function rewriteForAudience
 * @async
 * @param {string} markdownContent - The original markdown content that needs to be rewritten.
 * @param {string} audience - The target audience for which the content should be rewritten.
 * @param {string} requestId - A unique identifier for the request, used for tracking and logging.
 * @returns {Promise<string>} A promise that resolves to the rewritten markdown content tailored for the specified audience.
 *
 * Usage:
 * Call this function with the original markdown content, the desired audience, and a unique request identifier. 
 * The function uses OpenAI to generate a version of the content that is more suitable for the specified audience.
 */

import { callOpenAI } from '../llm/llm.ts';

export const rewriteForAudience = async (markdownContent: string, audience: string, requestId: string): Promise<string> => {
  const prompt = `Rewrite the following markdown content to be suitable for ${audience}:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};
