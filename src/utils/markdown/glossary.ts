/**
 * Generates a glossary from the provided markdown content.
 * 
 * This function extracts key terms from markdown content and provides a glossary with definitions by utilizing
 * the OpenAI language model. It sends the markdown content as a prompt to the OpenAI API and returns the
 * generated response as a glossary.
 *
 * @param markdownContent - The markdown content from which to extract key terms and generate a glossary.
 * @param requestId - A unique identifier for the request, used for tracking purposes.
 * @returns A promise that resolves to a string containing the generated glossary.
 *
 * Dependencies:
 * - Uses the `callOpenAI` function from '@/llm/llm.ts' to interact with the OpenAI API.
 */

import { parseMarkdown, stringifyMarkdown } from './markdown.ts';
import { callOpenAI } from '../llm/llm.ts';

export const generateGlossary = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `Extract key terms from the following markdown content and provide a glossary with definitions:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};
