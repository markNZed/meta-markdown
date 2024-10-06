/**
 * @module TokenUtils
 * @description A utility module for counting tokens in a given text string using the GPT-3 encoder.
 *
 * @function countTokens
 * @param {string} text - The input text string for which the token count is to be determined.
 * @returns {number} The number of tokens in the provided text.
 * @throws {TypeError} Throws an error if the input is not a string.
 *
 * @example
 * const tokenCount = countTokens("Hello, world!");
 * console.log(tokenCount); // Outputs the number of tokens in "Hello, world!".
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
