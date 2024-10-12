/**
 * This module provides functionality to manipulate Markdown Abstract Syntax Trees (AST).
 * 
 * @module MarkdownASTUtils
 * 
 * @function assignNodeIds
 * @param {MarkdownNode} ast - The root of the Markdown AST to which unique IDs will be assigned.
 * 
 * @description
 * The `assignNodeIds` function traverses the provided Markdown AST and assigns a unique ID
 * to each node in the format "node-X", where X is a sequential number starting from 0.
 * 
 * @example
 * const ast = /* your Markdown AST 
 * @hash 365d0f25af8465d11e2f7ca3b07a59cdc803ad7170cb1b7ced4117ed2731a4a4
 */

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
