/**
 * @module MarkdownUtils
 * 
 * This module provides utility functions for manipulating Markdown Abstract Syntax Trees (AST).
 * 
 * @function findNodesByType
 * @param {MarkdownNode} ast - The root node of the Markdown AST to search within.
 * @param {string} type - The type of nodes to find within the AST.
 * @returns {MarkdownNode[]} An array of nodes that match the specified type.
 * 
 * @example
 * const nodes = findNodesByType(ast, 'heading');
 * 
 * @function replaceNode
 * @param {MarkdownNode} ast - The root node of the Markdown AST to modify.
 * @param {MarkdownNode} targetNode - The node to be replaced in the AST.
 * @param {MarkdownNode} newNode - The new node that will replace the target node.
 * 
 * @example
 * replaceNode(ast, oldNode, newNode);
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
