/**
 * @module MarkdownEditing
 * 
 * This module provides functions for various types of editorial processing of markdown content using OpenAI's language model.
 * 
 * @function developmentalEdit
 * @param {string} markdownContent - The markdown content to be analyzed and improved.
 * @param {string} requestId - The unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the improved markdown content from a developmental editing perspective.
 * 
 * @function lineEdit
 * @param {string} markdownContent - The markdown content to be refined.
 * @param {string} requestId - The unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the improved markdown content from a line editing perspective.
 * 
 * @function copyEdit
 * @param {string} markdownContent - The markdown content to be corrected.
 * @param {string} requestId - The unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the improved markdown content from a copy editing perspective.
 * 
 * @function proofread
 * @param {string} markdownContent - The markdown content to be proofread.
 * @param {string} requestId - The unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the corrected markdown content after proofreading.
 * 
 * @function technicalEdit
 * @param {string} markdownContent - The markdown content requiring technical accuracy checks.
 * @param {string} requestId - The unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the improved markdown content from a technical editing perspective.
 * 
 * @function factCheck
 * @param {string} markdownContent - The markdown content to be fact-checked.
 * @param {string} requestId - The unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the corrected markdown content after fact-checking.
 * 
 * @example
 * const editedContent = await developmentalEdit("## My Markdown", "request123");
 * console.log(editedContent);
 
 * @hash 62bffd3be95d399508a042564f1b2b06834e6b478176e869e10bb23dc437b09f
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


