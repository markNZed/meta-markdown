// src/utils/markdown/glossary.ts

import { parseMarkdown, stringifyMarkdown } from './markdown.ts';
import { callOpenAI } from '../llm/llm.ts';

export const generateGlossary = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `Extract key terms from the following markdown content and provide a glossary with definitions:\n\n${markdownContent}`;
  const response = await callOpenAI(prompt, requestId);
  return response as string;
};
