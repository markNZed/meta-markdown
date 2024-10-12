// src/utils/markdown/commandSchema.ts

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
