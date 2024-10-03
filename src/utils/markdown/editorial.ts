// src/utils/editorial.ts

import { callOpenAI } from '../llm/llm.ts';
import { parseMarkdown, stringifyMarkdown } from './markdown.ts';

export const developmentalEdit = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a developmental editor, please analyze the structure and content of the following markdown and suggest improvements:\n\n${markdownContent}`;
  const response = await callOpenAI(prompt, requestId);
  return response;
};

export const lineEdit = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a line editor, please improve the sentence structure, tone, and style of the following markdown content:\n\n${markdownContent}`;
  const response = await callOpenAI(prompt, requestId);
  return response;
};

export const copyEdit = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a copy editor, please correct any grammatical errors, punctuation, and syntax in the following markdown content:\n\n${markdownContent}`;
  const response = await callOpenAI(prompt, requestId);
  return response;
};

export const proofread = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a proofreader, please check for any typos or formatting errors in the following markdown content and correct them:\n\n${markdownContent}`;
  const response = await callOpenAI(prompt, requestId);
  return response;
};

export const technicalEdit = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a technical editor, please ensure the technical accuracy and clarity of the following markdown content:\n\n${markdownContent}`;
  const response = await callOpenAI(prompt, requestId);
  return response;
};

export const factCheck = async (markdownContent: string, requestId: string): Promise<string> => {
  const prompt = `As a fact checker, please verify the correctness of claims, data, and references in the following markdown content:\n\n${markdownContent}`;
  const response = await callOpenAI(prompt, requestId);
  return response;
};


