/**
 * This file exports an interface `MarkdownNode` that represents a node in a Markdown abstract syntax tree (AST).
 * 
 * Interface `MarkdownNode`:
 * - `type` (string): Specifies the type of the node (e.g., 'heading', 'paragraph').
 * - `depth?` (number): Optional. Represents the depth of the node, typically used for headings.
 * - `value?` (string): Optional. Contains the text value of the node, if applicable.
 * - `children?` (MarkdownNode[]): Optional. An array of child nodes, allowing for nested structures.
 * 
 * Usage:
 * Implement this interface to create objects representing various elements of a Markdown document.
 */

export interface MarkdownNode {
    type: string;
    depth?: number;
    value?: string;
    children?: MarkdownNode[];
}