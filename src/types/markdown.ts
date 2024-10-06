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

export interface MarkdownNode {
    type: string;
    depth?: number;
    value?: string;
    children?: MarkdownNode[];
}