// src/scripts/rewriteForAudience.ts

import { readMarkdown, writeMarkdown } from '@/utils/markdown/fileIO.ts';
import { rewriteForAudience } from '@/utils/markdown/rewriter.ts';

const requestId = `rewrite-${Date.now()}`;

const main = async () => {
  const filePath = 'example.md';
  const content = await readMarkdown(filePath);
  const targetAudience = 'high school students';

  const rewrittenContent = await rewriteForAudience(content, targetAudience, requestId);

  await writeMarkdown('example_rewritten.md', rewrittenContent);
};

main();
