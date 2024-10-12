/**
 * Utility functions for working with Markdown AST nodes.
 *
 * This module provides functions to generate unique IDs for nodes,
 * find nodes by their IDs, and retrieve parent nodes along with their indices.
 *
 * @module MarkdownNodeUtils
 *
 * @function generateUniqueId
 * @returns {string} A unique node ID.
 * 
 * @function findNodeById
 * @param {MarkdownNode} root - The root of the AST.
 * @param {string} id - The ID of the node to find.
 * @returns {MarkdownNode | null} The found node or null if not found.
 *
 * @function findParentAndIndex
 * @param {MarkdownNode} root - The root of the AST.
 * @param {string} id - The ID of the child node.
 * @returns {{ parent: MarkdownNode | null; index: number }} The parent node and index of the child.
 *
 * @function findNodeAndParent
 * @param {MarkdownNode} root - The root of the AST.
 * @param {string} id - The ID of the node to find.
 * @returns {{ node: MarkdownNode | null; parent: MarkdownNode | null; index: number }} The node, its parent, and its index.
 
 * @hash a392a7ee35c61eb97e2fe255e8898731d59166d6bbcfbc2d2f848265ac1db6bb
 */

import { MarkdownNode } from '@/types/markdown.ts';
import { visit } from 'npm:unist-util-visit';

/**
 * Generates a unique ID for a node.
 * @returns {string} A unique node ID.
 */
export function generateUniqueId(): string {
  return `node-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Finds a node by its ID.
 * @param {MarkdownNode} root - The root of the AST.
 * @param {string} id - The ID of the node to find.
 * @returns {MarkdownNode | null} The found node or null.
 */
export function findNodeById(root: MarkdownNode, id: string): MarkdownNode | null {
  let foundNode: MarkdownNode | null = null;

  visit(root, (node: MarkdownNode, _index: number | undefined) => {
    if (node.id === id) {
      foundNode = node;
      return true;
    }
  });

  return foundNode;
}

/**
 * Finds the parent node and index of a child node by its ID.
 * @param {MarkdownNode} root - The root of the AST.
 * @param {string} id - The ID of the child node.
 * @returns {{ parent: MarkdownNode | null; index: number }} The parent node and index of the child.
 */
export function findParentAndIndex(root: MarkdownNode, id: string): { parent: MarkdownNode | null; index: number } {
  let parentNode: MarkdownNode | null = null;
  let nodeIndex: number = -1;

  visit(root, (node: MarkdownNode, _index: number | undefined) => {
    if (node.children) {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.id === id) {
          parentNode = node;
          nodeIndex = i;
          return true;
        }
      }
    }
  });

  return { parent: parentNode, index: nodeIndex };
}

/**
 * Finds a node and its parent by the node's ID.
 * @param {MarkdownNode} root - The root of the AST.
 * @param {string} id - The ID of the node to find.
 * @returns {{ node: MarkdownNode | null; parent: MarkdownNode | null; index: number }} The node, its parent, and its index.
 */
export function findNodeAndParent(root: MarkdownNode, id: string): { node: MarkdownNode | null; parent: MarkdownNode | null; index: number } {
    let targetNode: MarkdownNode | null = null;
    let parentNode: MarkdownNode | null = null;
    let nodeIndex: number = -1;
  
    visit(root, (node: MarkdownNode, index: number | undefined, parent: MarkdownNode | null) => {
      if (node.id === id) {
        targetNode = node;
        parentNode = parent;
        nodeIndex = index as number; // you can safely cast to number here
      }
    });
  
    return { node: targetNode, parent: parentNode, index: nodeIndex };
}