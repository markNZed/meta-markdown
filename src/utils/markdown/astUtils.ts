/**
 * Provides utility functions for manipulating Markdown AST nodes.
 *
 * @function findNodesByType
 * @description Finds all nodes of a specified type within a given Markdown AST.
 * @param {MarkdownNode} ast - The root of the Markdown AST to search.
 * @param {string} type - The type of nodes to find.
 * @returns {MarkdownNode[]} An array of nodes that match the specified type.
 *
 * @function replaceNode
 * @description Replaces a target node with a new node in a given Markdown AST.
 * @param {MarkdownNode} ast - The root of the Markdown AST to modify.
 * @param {MarkdownNode} targetNode - The node to be replaced.
 * @param {MarkdownNode} newNode - The node to insert in place of the target node.
 * @returns {void}
 *
 * Import types from '@/types/markdown.ts'.
 */

import { MarkdownNode } from '../../types/markdown.ts';

export const findNodesByType = (ast: MarkdownNode, type: string): MarkdownNode[] => {
  const nodes: MarkdownNode[] = [];
  const visitNode = (node: MarkdownNode) => {
    if (node.type === type) {
      nodes.push(node);
    }
    if (node.children) {
      node.children.forEach(visitNode);
    }
  };
  visitNode(ast);
  return nodes;
};

export const replaceNode = (ast: MarkdownNode, targetNode: MarkdownNode, newNode: MarkdownNode): void => {
  const visitNode = (node: MarkdownNode) => {
    if (node.children) {
      node.children = node.children.map(child => (child === targetNode ? newNode : child));
      node.children.forEach(visitNode);
    }
  };
  visitNode(ast);
};
