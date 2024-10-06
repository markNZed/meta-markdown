import { readMarkdown } from '@/utils/markdown/fileIO.ts';
import { getSummaryPrompt } from '../prompts/getSummaryPrompt.js';
import { callOpenAI } from '@/utils/llm/llm.ts';


export const summarize = async () => {
  try {
    const content = await readMarkdown('example.md');
    const prompt = getSummaryPrompt(content);
    const summary = await callOpenAI({ prompt });
    console.log('Summary:', summary);
  } catch (error) {
    console.error('Error summarizing Markdown:', error);
  }
};
