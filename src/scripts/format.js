import { formatMarkdown } from '@/utils/markdown/fileIO.ts';

export const format = async () => {
  try {
    await formatMarkdown('example.md');
    console.log('Markdown file formatted successfully.');
  } catch (error) {
    console.error('Error formatting Markdown:', error);
  }
};

