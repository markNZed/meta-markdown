// ./src/scripts/describeMarkdownStyle.ts

import { readMarkdown, writeMarkdown } from '@/utils/markdown/fileIO.ts';
import { callOpenAI } from '@/utils/llm/llm.ts';
import { parseMarkdown } from '@/utils/markdown/markdown.ts';
import { config } from '@/config.ts';

/**
 * @module DescribeMarkdownStyle
 * 
 * This module provides functionality to read a Markdown file, convert it to an Abstract Syntax Tree (AST),
 * and describe the Markdown style using OpenAI's language model.
 */

async function describeMarkdownStyle(inputFilePath: string): Promise<string | undefined> {
  try {
    // Read the Markdown content from the specified file
    const markdownContent = await readMarkdown(inputFilePath);
    
    // Parse the Markdown content into an AST
    const ast = parseMarkdown(markdownContent);
    
    // Convert the AST back to a string representation for sending to LLM
    const astString = JSON.stringify(ast, null, 2);
    
    // Create a prompt to ask the LLM for a description of the Markdown style
    const prompt = `Based on the following Abstract Syntax Tree (AST) representation of a Markdown file, please provide a formal description of the Markdown style used.\n\nAST:\n${astString}`;
    
    // Call the OpenAI API with the prompt to get the description
    const description = await callOpenAI({
      prompt,
      requestId: `request-${Date.now()}`, // Unique ID for tracking
      configOverrides: {
        maxInputTokens: 32000,
      },
    });
    
    // Write the output description to a specified file
    return description as string;
  } catch (error) {
    console.error('Error describing Markdown style:', error);
  }
}

const inputFilePath = config.markdownDir + '/HumanistProcessPhilosophy.md'; // Change this to your input file
const style = await describeMarkdownStyle(inputFilePath);
console.log(style);