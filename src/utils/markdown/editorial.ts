/**
 * This module provides a set of functions to perform various types of editing and verification on markdown content
 * by leveraging OpenAI's capabilities. Each function sends a specific prompt to OpenAI, requesting a particular
 * type of editing or checking to be performed on the provided markdown content.
 *
 * Exported functions:
 *
 * - `developmentalEdit(markdownContent: string, requestId: string): Promise<string>`: Analyzes the structure and content
 *   of the markdown and suggests improvements as a developmental editor.
 *
 * - `lineEdit(markdownContent: string, requestId: string): Promise<string>`: Improves the sentence structure, tone, and style
 *   of the markdown content as a line editor.
 *
 * - `copyEdit(markdownContent: string, requestId: string): Promise<string>`: Corrects grammatical errors, punctuation, and syntax
 *   in the markdown content as a copy editor.
 *
 * - `proofread(markdownContent: string, requestId: string): Promise<string>`: Checks for typos or formatting errors and corrects them
 *   as a proofreader.
 *
 * - `technicalEdit(markdownContent: string, requestId: string): Promise<string>`: Ensures the technical accuracy and clarity
 *   of the markdown content as a technical editor.
 *
 * - `factCheck(markdownContent: string, requestId: string): Promise<string>`: Verifies the correctness of claims, data, and references
 *   in the markdown content as a fact checker.
 *
 * The functions require `markdownContent` to be a string containing the markdown text to be edited or checked,
 * and `requestId` to track the request. They return a promise that resolves to a string with the edited or verified content.
 */

import { callOpenAI } from '../llm/llm.ts';
import { parseMarkdown, stringifyMarkdown } from './markdown.ts';

export const developmentalEdit = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a developmental editor, please analyze the structure and content of the following markdown and suggest improvements:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};

export const lineEdit = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a line editor, please improve the sentence structure, tone, and style of the following markdown content:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};

export const copyEdit = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a copy editor, please correct any grammatical errors, punctuation, and syntax in the following markdown content:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};

export const proofread = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a proofreader, please check for any typos or formatting errors in the following markdown content and correct them:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};

export const technicalEdit = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a technical editor, please ensure the technical accuracy and clarity of the following markdown content:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};

export const factCheck = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a fact checker, please verify the correctness of claims, data, and references in the following markdown content:\n\n${markdownContent}`;
  const response = await callOpenAI({ prompt, requestId });
  return response as string;
};


