/**
 * This module exports a function to count the number of tokens in a given text string.
 *
 * @function countTokens
 * @param {string} text - The input text string to be tokenized.
 * @returns {number} The number of tokens in the input text.
 * @throws {TypeError} Throws an error if the input is not a string.
 *
 * Usage:
 * ```typescript
 * import { countTokens } from './path/to/module';
 *
 * const text = "Hello, world!";
 * const tokenCount = countTokens(text);
 * console.log(tokenCount); // Outputs the number of tokens
 * ```
 */

import { encode } from 'npm:gpt-3-encoder'; // Updated version

export const countTokens = (text: string): number => {
  // Input validation to ensure text is a string
  if (typeof text !== 'string') {
    throw new TypeError('Expected a string input');
  }
  
  const tokens = encode(text);
  return tokens.length;
};
