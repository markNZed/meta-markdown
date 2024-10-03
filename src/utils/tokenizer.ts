// src/utils/tokenizer.ts

import { encode } from 'npm:gpt-3-encoder'; // Updated version

export const countTokens = (text: string): number => {
  const tokens = encode(text);
  return tokens.length;
};
