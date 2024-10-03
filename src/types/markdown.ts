export interface MarkdownNode {
    type: string;
    depth?: number;
    value?: string;
    children?: MarkdownNode[];
}