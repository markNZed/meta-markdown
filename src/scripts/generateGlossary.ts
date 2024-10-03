// src/scripts/generateGlossary.ts

import { readMarkdown, writeMarkdown } from '../utils/markdown/fileIO.ts';
import { generateGlossary } from '../utils/markdown/glossary.ts';

const requestId = `glossary-index-${Date.now()}`;

const main = async () => {
  const filePath = 'example.md';
  const content = await readMarkdown(filePath);

  const glossary = await generateGlossary(content, requestId);

  // Append glossary and index to the markdown content
  const updatedContent = `${content}\n\n## Glossary\n${glossary}\n`;

  await writeMarkdown('example_with_glossary_and_index.md', updatedContent);
};

main();
