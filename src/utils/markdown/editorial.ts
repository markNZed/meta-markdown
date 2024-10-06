/**
 * Provides a set of functions to perform various types of editing and verification on markdown content using AI.
 *
 * @function developmentalEdit
 * Analyzes the structure and content of the markdown and suggests improvements.
 * @param {string} markdownContent - The markdown content to be edited.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the edited markdown content.
 *
 * @function lineEdit
 * Improves the sentence structure, tone, and style of the markdown content.
 * @param {string} markdownContent - The markdown content to be edited.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the edited markdown content.
 *
 * @function copyEdit
 * Corrects grammatical errors, punctuation, and syntax in the markdown content.
 * @param {string} markdownContent - The markdown content to be edited.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the edited markdown content.
 *
 * @function proofread
 * Checks for typos or formatting errors in the markdown content and corrects them.
 * @param {string} markdownContent - The markdown content to be proofread.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the proofread markdown content.
 *
 * @function technicalEdit
 * Ensures the technical accuracy and clarity of the markdown content.
 * @param {string} markdownContent - The markdown content to be edited.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the technically edited markdown content.
 *
 * @function factCheck
 * Verifies the correctness of claims, data, and references in the markdown content.
 * @param {string} markdownContent - The markdown content to be fact-checked.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} A promise that resolves to the fact-checked markdown content.
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


