// tests/commandExecutor.test.ts

import { assertEquals, assertThrows } from "@std/assert";
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { assignNodeIds } from '@/utils/markdown/idAssigner.ts';
import { executeCommands } from '@/utils/markdown/commandExecutor.ts';
import { CommandBatch } from '@/utils/markdown/commandSchema.ts';

/**
 * Sample test to verify the Insert command.
 */
Deno.test("Insert Command", () => {
  const markdown = `
# Introduction

Welcome to the document.
`;

  const processor = unified().use(remarkParse);
  const ast = processor.parse(markdown) as any;

  assignNodeIds(ast);

  const insertCommand: CommandBatch = {
    commands: [
      {
        action: 'insert',
        target: ast.id, // Assuming root node has id 'node-0'
        position: 'lastChild',
        node: {
          type: 'heading',
          depth: 2,
          children: [
            { type: 'text', value: 'Summary', id: 'text-0' }
          ]
        }
      }
    ]
  };

  executeCommands(ast, insertCommand);

  // Verify that a new heading was added
  const summaryNode = ast.children.find((child: any) => child.type === 'heading' && child.depth === 2);
  assertEquals(summaryNode.value, undefined); // Value is within children
  const summaryTextNode = summaryNode.children.find((child: any) => child.type === 'text');
  assertEquals(summaryTextNode.value, 'Summary');
});

/**
 * Sample test to verify the Delete command.
 */
Deno.test("Delete Command", () => {
  const markdown = `
# Introduction

Welcome to the document.
`;

  const processor = unified().use(remarkParse);
  const ast = processor.parse(markdown) as any;

  assignNodeIds(ast);

  const paragraphNode = ast.children.find((child: any) => child.type === 'paragraph');

  const deleteCommand: CommandBatch = {
    commands: [
      {
        action: 'delete',
        target: paragraphNode.id
      }
    ]
  };

  executeCommands(ast, deleteCommand);

  // Verify that the paragraph was deleted
  const deletedNode = ast.children.find((child: any) => child.type === 'paragraph');
  assertEquals(deletedNode, undefined);
});

/**
 * Sample test to verify the Modify command.
 */
Deno.test("Modify Command", () => {
  const markdown = `
# Introduction

Welcome to the document.
`;

  const processor = unified().use(remarkParse);
  const ast = processor.parse(markdown) as any;

  assignNodeIds(ast);

  const headingNode = ast.children.find((child: any) => child.type === 'heading');

  // Step 3: Find the text child node within the heading
  const textNode = headingNode.children.find((child: any) => child.type === 'text');


  const modifyCommand: CommandBatch = {
    commands: [
      {
        action: 'modify',
        target: textNode.id,
        value: 'Getting Started'
      }
    ]
  };

  executeCommands(ast, modifyCommand);

  // Verify that the heading text was modified
  const modifiedTextNode = headingNode.children.find((child: any) => child.type === 'text');
  assertEquals(modifiedTextNode.value, 'Getting Started');
});

/**
 * Test to verify error handling when target node is not found.
 */
Deno.test("Delete Command - Node Not Found", async () => {
  const markdown = `
# Introduction

Welcome to the document.
`;

  const processor = unified().use(remarkParse);
  const ast = processor.parse(markdown) as any;

  assignNodeIds(ast);

  const deleteCommand: CommandBatch = {
    commands: [
      {
        action: 'delete',
        target: 'non-existent-node-id'
      }
    ]
  };

  assertThrows(
    () => {
      executeCommands(ast, deleteCommand);
    },
    Error,
    'Delete Command: Node non-existent-node-id not found.'
  );
});
