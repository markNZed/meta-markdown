/**
 * @module MarkdownAST
 * 
 * This module provides utility functions for manipulating a Markdown Abstract Syntax Tree (AST).
 * 
 * @function findNodesByType
 * @param {MarkdownNode} ast - The root node of the Markdown AST to search through.
 * @param {string} type - The type of nodes to find within the AST.
 * @returns {MarkdownNode[]} An array of nodes that match the specified type.
 * 
 * @function replaceNode
 * @param {MarkdownNode} ast - The root node of the Markdown AST in which to replace nodes.
 * @param {MarkdownNode} targetNode - The node to be replaced.
 * @param {MarkdownNode} newNode - The new node that will replace the target node.
 * 
 * Usage:
 * 
 * 1. To find all nodes of a specific type in a Markdown AST, call `findNodesByType(ast, 'desiredType')`.
 * 2. To replace a specific node in the AST, call `replaceNode(ast, targetNode, newNode)`, where `targetNode` is the node you want to replace, and `newNode` is the new node to insert.
 
 * @hash a5184e658809191d07b498f190a68922f4c2d1b2686834fa0b8d3e8f7cdbf3bf
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
