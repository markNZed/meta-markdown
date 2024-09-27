import { readMarkdown } from '../utils/fileIO.ts';
import { getSummaryPrompt } from '../prompts/getSummaryPrompt.js';
import { callOpenAI } from '../utils/ai.ts';


export const summarize = async () => {
  try {
    const content = await readMarkdown('md-files/example.md');
    const prompt = getSummaryPrompt(content);
    const summary = await callOpenAI(prompt);
    console.log('Summary:', summary);
  } catch (error) {
    console.error('Error summarizing Markdown:', error);
  }
};