import { readMarkdown, writeMarkdown } from '@/utils/markdown/fileIO.ts';
import { callOpenAI } from '@/utils/llm/llm.ts';

export const grammarCheck = async () => {
  try {
    const content = await readMarkdown('example.md');
    const prompt = getGrammarPrompt(content);
    const corrected = await callOpenAI({ prompt });
    await writeMarkdown('example_corrected.md', corrected);
    console.log('Grammar check completed. Corrected file saved as example_corrected.md');
  } catch (error) {
    console.error('Error during grammar check:', error);
  }
};

