/**
 * This module provides functions to manipulate Markdown abstract syntax trees (AST).
 * 
 * @function findNodesByType
 * @description Finds and returns all nodes of a specified type within a given Markdown AST.
 * @param {MarkdownNode} ast - The root node of the Markdown AST to search through.
 * @param {string} type - The type of nodes to search for within the AST.
 * @returns {MarkdownNode[]} An array of nodes that match the specified type.
 * 
 * @function replaceNode
 * @description Replaces a specified node with a new node within a given Markdown AST.
 * @param {MarkdownNode} ast - The root node of the Markdown AST to modify.
 * @param {MarkdownNode} targetNode - The node in the AST to replace.
 * @param {MarkdownNode} newNode - The new node to replace the target node with.
 * @returns {void}
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
