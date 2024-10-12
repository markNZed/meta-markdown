/**
 * @module MarkdownNode
 * 
 * This module exports the `MarkdownNode` interface which represents a node in the Markdown Abstract Syntax Tree (AST).
 * 
 * @interface MarkdownNode
 * @extends Parent
 * 
 * @property {string} id - A unique identifier for the node.
 * @property {string} type - The type of the node (e.g., 'heading', 'paragraph', etc.).
 * @property {number} [depth] - The depth of the node, applicable for heading types.
 * @property {string} [value] - The text content for text nodes.
 * @property {Record<string, any>} [properties] - Additional properties associated with the node.
 * @property {MarkdownNode[]} [children] - An array of child nodes.
 * 
 * @example
 * const node: MarkdownNode = {
 *   id: '1',
 *   type: 'heading',
 *   depth: 1,
 *   value: 'Introduction',
 *   properties: {},
 *   children: []
 * };
 
 * @hash daeb077a46ca11504f4c14fe9a3a97cccccaa7efdf6a903c08fe67de2711acf4
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
