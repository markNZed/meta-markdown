// src/utils/llm/tokenizer.ts

import { encode } from 'npm:gpt-3-encoder'; // Updated version

export const countTokens = (text: string): number => {
  // Input validation to ensure text is a string
  if (typeof text !== 'string') {
    throw new TypeError('Expected a string input');
  }
  
  const tokens = encode(text);
  return tokens.length;
};
