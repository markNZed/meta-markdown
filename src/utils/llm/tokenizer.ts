/**
 * Utility functions for token handling.
 * 
 * This module exports a function to count the number of tokens in a given text string.
 * 
 * @module TokenUtils
 * 
 * @function countTokens
 * @param {string} text - The input text for which the token count is to be determined.
 * @returns {number} The number of tokens in the input text.
 * @throws {TypeError} Throws an error if the input is not a string.
 * 
 * @example
 * const tokenCount = countTokens("Hello, world!"); // Returns the number of tokens in the string.
 
 * @hash d95ae099c72f29d97e27ae134e423ca5bbe6b1f3f5e5efecf422f5b0e1d848fe
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
