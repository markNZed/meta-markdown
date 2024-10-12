// src/utils/markdown/idAssigner.ts

import { MarkdownNode } from '@/types/markdown.ts';
import { visit } from 'npm:unist-util-visit';

/**
 * Assigns unique IDs to each node in the AST.
 * @param {MarkdownNode} ast - The root of the Markdown AST.
 */
export function assignNodeIds(ast: MarkdownNode): void {
  let nodeIdCounter = 0;

  visit(ast, (node: any) => {
    node.id = `node-${nodeIdCounter++}`;
  });
}
