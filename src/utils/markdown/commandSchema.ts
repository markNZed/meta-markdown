/**
 * @module CommandModule
 * 
 * This module defines interfaces for various command types used in a command processing system for managing Markdown nodes.
 * 
 * Exported Interfaces:
 * 
 * - `BaseCommand`: The base interface for all commands, specifying the action type.
 * - `InsertCommand`: Represents an insert action, requiring a target node ID, a position, and a node to insert.
 * - `DeleteCommand`: Represents a delete action, requiring a target node ID.
 * - `MoveCommand`: Represents a move action, requiring a target node ID, a destination node ID, and a position relative to the destination.
 * - `ModifyCommand`: Represents a modify action, requiring a target node ID and optional properties and value to update.
 * - `ReplaceCommand`: Represents a replace action, requiring a target node ID and a new node to replace with.
 * - `Command`: A union type representing all possible commands (Insert, Delete, Move, Modify, Replace).
 * - `CommandBatch`: Represents a batch of commands, containing an array of command objects.
 * 
 * Usage:
 * 
 * To use these interfaces, import them as needed and create objects that conform to the desired command interface. 
 * For example, to create an insert command:
 * 
 * ```typescript
 * const insertCommand: InsertCommand = {
 *   action: 'insert',
 *   target: 'nodeId123',
 *   position: 'after',
 *   node: { /* node properties 
 * @hash ec8fe9f5506938cd7e1402a53f48a4c01f87c1b2679e413b07513979821e205a
 */

import { MarkdownNode } from '@/types/markdown.ts';

/**
 * Base interface for all commands.
 */
export interface BaseCommand {
  action: 'insert' | 'delete' | 'move' | 'modify' | 'replace';
}

/**
 * Interface for the Insert command.
 */
export interface InsertCommand extends BaseCommand {
  action: 'insert';
  target: string; // ID of the reference node
  position: 'before' | 'after' | 'firstChild' | 'lastChild' | number; // Position relative to the target
  node: Partial<MarkdownNode>; // Node to insert
}

/**
 * Interface for the Delete command.
 */
export interface DeleteCommand extends BaseCommand {
  action: 'delete';
  target: string; // ID of the node to delete
}

/**
 * Interface for the Move command.
 */
export interface MoveCommand extends BaseCommand {
  action: 'move';
  target: string; // ID of the node to move
  destination: string; // ID of the destination node
  position: 'before' | 'after' | 'firstChild' | 'lastChild' | number; // Position relative to the destination
}

/**
 * Interface for the Modify command.
 */
export interface ModifyCommand extends BaseCommand {
  action: 'modify';
  target: string; // ID of the node to modify
  properties?: Record<string, any>; // Properties to update
  value?: string; // New value for nodes with a value property
}

/**
 * Interface for the Replace command.
 */
export interface ReplaceCommand extends BaseCommand {
  action: 'replace';
  target: string; // ID of the node to replace
  node: Partial<MarkdownNode>; // New node to replace with
}

/**
 * Union type for all possible commands.
 */
export type Command =
  | InsertCommand
  | DeleteCommand
  | MoveCommand
  | ModifyCommand
  | ReplaceCommand;

/**
 * Interface for a batch of commands.
 */
export interface CommandBatch {
  commands: Command[];
}
