// src/utils/rewriter.ts

import { callOpenAI } from '../ai.ts';

export const rewriteForAudience = async (markdownContent: string, audience: string, requestId: string): Promise<string> => {
  const prompt = `Rewrite the following markdown content to be suitable for ${audience}:\n\n${markdownContent}`;
  const response = await callOpenAI(prompt, requestId);
  return response;
};