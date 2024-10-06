/**
 * This module exports a function to rewrite markdown content for a specified audience.
 *
 * @function rewriteForAudience
 * @async
 * @param {string} markdownContent - The markdown content to be rewritten.
 * @param {string} audience - The target audience for the rewritten content.
 * @param {string} requestId - A unique identifier for the request, used for tracking.
 * @returns {Promise<string>} - A promise that resolves to the rewritten markdown content.
 *
 * This function utilizes OpenAI's API to transform the provided markdown content
 * so that it is suitable for the specified audience. It constructs a prompt using
 * the audience and the original markdown content, and then calls an LLM function
 * to generate the rewritten content.
 */

import { callOpenAI } from '../llm/llm.ts';

export const rewriteForAudience = async (markdownContent: string, audience: string, requestId: string): Promise<string> => {
  const prompt = `Rewrite the following markdown content to be suitable for ${audience}:\n\n${markdownContent}`;
  const response = await callOpenAI(prompt, requestId);
  return response as string;
};
