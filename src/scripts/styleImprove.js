import { readMarkdown, writeMarkdown } from '../utils/fileIO.ts';
import { getStylePrompt } from '../prompts/getStylePrompt.js';
import { callOpenAI } from '../utils/ai.ts';

export const styleImprove = async () => {
  try {
    const content = await readMarkdown('example.md');
    const prompt = getStylePrompt(content);
    const improved = await callOpenAI(prompt);
    await writeMarkdown('example_improved.md', improved);
    console.log('Style improvement completed. Improved file saved as example_improved.md');
  } catch (error) {
    console.error('Error during style improvement:', error);
  }
};

