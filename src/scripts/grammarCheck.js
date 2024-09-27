import { readMarkdown, writeMarkdown } from '../utils/fileIO.ts';
import { callOpenAI } from '../utils/ai.ts';

export const grammarCheck = async () => {
  try {
    const content = await readMarkdown('md-files/example.md');
    const prompt = getGrammarPrompt(content);
    const corrected = await callOpenAI(prompt);
    await writeMarkdown('md-files/example_corrected.md', corrected);
    console.log('Grammar check completed. Corrected file saved as example_corrected.md');
  } catch (error) {
    console.error('Error during grammar check:', error);
  }
};

