import { formatMarkdown } from '../utils/fileIO.ts';

export const format = async () => {
  try {
    await formatMarkdown('md-files/example.md');
    console.log('Markdown file formatted successfully.');
  } catch (error) {
    console.error('Error formatting Markdown:', error);
  }
};

