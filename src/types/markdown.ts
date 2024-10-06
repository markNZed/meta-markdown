/**
 * Provides an interface for representing nodes in a Markdown abstract syntax tree (AST).
 * 
 * @interface MarkdownNode
 * 
 * @property {string} type - The type of the Markdown node, such as 'heading', 'paragraph', etc.
 * @property {number} [depth] - Optional. The depth of the node, typically used for headings.
 * @property {string} [value] - Optional. The textual value of the node, applicable for text nodes.
 * @property {MarkdownNode[]} [children] - Optional. An array of child nodes, representing nested structures.
 * 
 * Exported functions or interfaces implementing this structure can be used to parse or manipulate
 * Markdown content by traversing the tree structure and accessing the properties of each node.
 */

export interface MarkdownNode {
    type: string;
    depth?: number;
    value?: string;
    children?: MarkdownNode[];
}