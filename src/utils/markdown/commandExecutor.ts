// src/utils/markdown/commandExecutor.ts

import { MarkdownNode } from '@/types/markdown.ts';
import { CommandBatch, InsertCommand, DeleteCommand, MoveCommand, ModifyCommand, ReplaceCommand } from './commandSchema.ts';
import logger from '@/utils/logger.ts';
import { findNodeById, findParentAndIndex, findNodeAndParent, generateUniqueId } from '@/utils/markdown/helpers.ts';

/**
 * Executes a batch of commands on the AST.
 * @param {MarkdownNode} ast - The root of the Markdown AST.
 * @param {CommandBatch} commandBatch - The batch of commands to execute.
 */
export function executeCommands(ast: MarkdownNode, commandBatch: CommandBatch): void {
  for (const command of commandBatch.commands) {
    if (!command.action) {
      throw new Error(`Command is missing action property: ${JSON.stringify(command)}`);
    }
    try {
      switch (command.action) {
        case 'insert':
          handleInsert(ast, command as InsertCommand);
          break;
        case 'delete':
          handleDelete(ast, command as DeleteCommand);
          break;
        case 'move':
          handleMove(ast, command as MoveCommand);
          break;
        case 'modify':
          handleModify(ast, command as ModifyCommand);
          break;
        case 'replace':
          handleReplace(ast, command as ReplaceCommand);
          break;
        default:
          logger.warning(`Unknown command action: ${command}`);
      }
    } catch (error) {
      logger.error(`Error executing command ${JSON.stringify(command)}: ${error}`);
    }
  }
}

/**
 * Handles the Insert command.
 * @param {MarkdownNode} ast - The root of the AST.
 * @param {InsertCommand} command - The Insert command to execute.
 */
function handleInsert(ast: MarkdownNode, command: InsertCommand): void {
  const targetNode = findNodeById(ast, command.target);
  if (!targetNode) {
    throw new Error(`Insert Command: Target node ${command.target} not found.`);
  }

  const newNode: MarkdownNode = {
    id: generateUniqueId(),
    type: command.node.type || 'paragraph', // Default to paragraph if type not specified
    depth: command.node.depth,
    value: command.node.value,
    properties: command.node.properties || {},
    children: command.node.children || [],
  };

  if (!('children' in targetNode)) {
    throw new Error(`Insert Command: Target node ${command.target} cannot have children.`);
  }

  switch (command.position) {
    case 'before':
      insertBefore(ast, targetNode, newNode);
      break;
    case 'after':
      insertAfter(ast, targetNode, newNode);
      break;
    case 'firstChild':
      targetNode.children!.unshift(newNode);
      break;
    case 'lastChild':
      targetNode.children!.push(newNode);
      break;
    default:
      if (typeof command.position === 'number') {
        targetNode.children!.splice(command.position, 0, newNode);
      } else {
        throw new Error(`Insert Command: Invalid position ${command.position}.`);
      }
  }

  logger.info(`Inserted node ${newNode.id} as ${command.position} of ${command.target}.`);
}

/**
 * Handles the Delete command.
 * @param {MarkdownNode} ast - The root of the AST.
 * @param {DeleteCommand} command - The Delete command to execute.
 */
function handleDelete(ast: MarkdownNode, command: DeleteCommand): void {
  const { parent, index } = findParentAndIndex(ast, command.target);
  if (parent && index !== -1) {
    parent.children!.splice(index, 1);
    logger.info(`Deleted node ${command.target}.`);
  } else {
    throw new Error(`Delete Command: Node ${command.target} not found.`);
  }
}

/**
 * Handles the Move command.
 * @param {MarkdownNode} ast - The root of the AST.
 * @param {MoveCommand} command - The Move command to execute.
 */
function handleMove(ast: MarkdownNode, command: MoveCommand): void {
  const { node: movingNode, parent: oldParent, index: oldIndex } = findNodeAndParent(ast, command.target);
  if (!movingNode || !oldParent || oldIndex === -1) {
    throw new Error(`Move Command: Node ${command.target} not found.`);
  }

  // Remove node from old parent
  oldParent.children!.splice(oldIndex, 1);

  const destinationNode = findNodeById(ast, command.destination);
  if (!destinationNode) {
    throw new Error(`Move Command: Destination node ${command.destination} not found.`);
  }

  if (!('children' in destinationNode)) {
    throw new Error(`Move Command: Destination node ${command.destination} cannot have children.`);
  }

  switch (command.position) {
    case 'before':
      insertBefore(ast, destinationNode, movingNode);
      break;
    case 'after':
      insertAfter(ast, destinationNode, movingNode);
      break;
    case 'firstChild':
      destinationNode.children!.unshift(movingNode);
      break;
    case 'lastChild':
      destinationNode.children!.push(movingNode);
      break;
    default:
      if (typeof command.position === 'number') {
        destinationNode.children!.splice(command.position, 0, movingNode);
      } else {
        throw new Error(`Move Command: Invalid position ${command.position}.`);
      }
  }

  logger.info(`Moved node ${command.target} to ${command.position} of ${command.destination}.`);
}

/**
 * Handles the Modify command.
 * @param {MarkdownNode} ast - The root of the AST.
 * @param {ModifyCommand} command - The Modify command to execute.
 */
function handleModify(ast: MarkdownNode, command: ModifyCommand): void {
  const targetNode = findNodeById(ast, command.target);
  if (!targetNode) {
    throw new Error(`Modify Command: Node ${command.target} not found.`);
  }

  if (command.properties) {
    Object.assign(targetNode, command.properties);
  }

  if (command.value !== undefined) {
    (targetNode as any).value = command.value;
  }

  logger.info(`Modified node ${command.target}.`);
}

/**
 * Handles the Replace command.
 * @param {MarkdownNode} ast - The root of the AST.
 * @param {ReplaceCommand} command - The Replace command to execute.
 */
function handleReplace(ast: MarkdownNode, command: ReplaceCommand): void {
  const { parent, index } = findParentAndIndex(ast, command.target);
  if (parent && index !== -1) {
    const newNode: MarkdownNode = {
      id: generateUniqueId(),
      type: command.node.type || 'paragraph',
      depth: command.node.depth,
      value: command.node.value,
      properties: command.node.properties || {},
      children: command.node.children || [],
    };
    parent.children![index] = newNode;
    logger.info(`Replaced node ${command.target} with node ${newNode.id}.`);
  } else {
    throw new Error(`Replace Command: Node ${command.target} not found.`);
  }
}

/**
 * Inserts a node before the target node within the AST.
 * @param {MarkdownNode} ast - The root of the AST.
 * @param {MarkdownNode} targetNode - The node before which to insert.
 * @param {MarkdownNode} newNode - The node to insert.
 */
function insertBefore(ast: MarkdownNode, targetNode: MarkdownNode, newNode: MarkdownNode): void {
  const { parent, index } = findParentAndIndex(ast, targetNode.id);
  if (parent && index !== -1) {
    parent.children!.splice(index, 0, newNode);
    logger.info(`Inserted node ${newNode.id} before node ${targetNode.id}.`);
  } else {
    throw new Error(`Insert Before: Parent of node ${targetNode.id} not found.`);
  }
}

/**
 * Inserts a node after the target node within the AST.
 * @param {MarkdownNode} ast - The root of the AST.
 * @param {MarkdownNode} targetNode - The node after which to insert.
 * @param {MarkdownNode} newNode - The node to insert.
 */
function insertAfter(ast: MarkdownNode, targetNode: MarkdownNode, newNode: MarkdownNode): void {
  const { parent, index } = findParentAndIndex(ast, targetNode.id);
  if (parent && index !== -1) {
    parent.children!.splice(index + 1, 0, newNode);
    logger.info(`Inserted node ${newNode.id} after node ${targetNode.id}.`);
  } else {
    throw new Error(`Insert After: Parent of node ${targetNode.id} not found.`);
  }
}
