/**
 * @module MarkdownNode
 * 
 * This module exports the `MarkdownNode` interface, which represents a node in a Markdown document.
 * 
 * @interface MarkdownNode
 * @property {string} type - The type of the node (e.g., heading, paragraph).
 * @property {number} [depth] - The depth level of the node, applicable for heading nodes.
 * @property {string} [value] - The textual content of the node.
 * @property {MarkdownNode[]} [children] - An optional array of child nodes, allowing for nested structures.
 * 
 * @example
 * // Example usage of MarkdownNode interface
 * const headingNode: MarkdownNode = {
 *     type: 'heading',
 *     depth: 1,
 *     value: 'Introduction',
 *     children: []
 * };
 */

import { Parent } from 'npm:unist';

/**
 * Represents a node in the Markdown AST with an added unique identifier.
 */
export interface MarkdownNode extends Parent {
  id: string; // Unique identifier for the node
  type: string; // e.g., 'heading', 'paragraph', etc.
  depth?: number; // Applicable for headings
  value?: string; // Text content for text nodes
  properties?: Record<string, any>; // Additional properties
  children?: MarkdownNode[]; // Child nodes
}
