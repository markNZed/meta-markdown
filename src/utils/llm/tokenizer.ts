/**
 * @fileoverview This module exports a function for counting the number of tokens in a given string using the GPT-3 encoder.
 * 
 * @function countTokens
 * @description Counts the number of tokens in a given string using the GPT-3 encoder.
 * @param {string} text - The text to be tokenized.
 * @returns {number} The number of tokens in the provided text.
 * @throws {TypeError} Throws an error if the input is not a string.
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
