/**
 * @module MarkdownEditing
 * 
 * This module provides a set of functions to perform various editing tasks on markdown content using the OpenAI API.
 * 
 * Each function takes in a string of markdown content and a request ID, and returns a Promise that resolves to a string with the edited content.
 * 
 * @function developmentalEdit
 * @param {string} markdownContent - The markdown content to be analyzed and improved.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} - A promise that resolves to the improved markdown content after developmental editing.
 * 
 * @function lineEdit
 * @param {string} markdownContent - The markdown content to be improved for sentence structure, tone, and style.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} - A promise that resolves to the improved markdown content after line editing.
 * 
 * @function copyEdit
 * @param {string} markdownContent - The markdown content to be corrected for grammatical errors and syntax.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} - A promise that resolves to the corrected markdown content after copy editing.
 * 
 * @function proofread
 * @param {string} markdownContent - The markdown content to be checked for typos and formatting errors.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} - A promise that resolves to the corrected markdown content after proofreading.
 * 
 * @function technicalEdit
 * @param {string} markdownContent - The markdown content to be ensured for technical accuracy and clarity.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} - A promise that resolves to the improved markdown content after technical editing.
 * 
 * @function factCheck
 * @param {string} markdownContent - The markdown content to be verified for correctness of claims and data.
 * @param {string} requestId - A unique identifier for the request.
 * @returns {Promise<string>} - A promise that resolves to the verified markdown content after fact-checking.
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


