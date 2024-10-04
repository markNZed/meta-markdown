// src/utils/markdown/astUtils.ts

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
