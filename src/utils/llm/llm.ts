/**
 * Provides utility functions to interact with the OpenAI API and process responses.
 * 
 * @function callOpenAI
 * @description Calls the OpenAI API with a given prompt, utilizing caching to improve performance. This function checks for cached responses and returns them if available and valid. Otherwise, it makes a request to the OpenAI API. The response can be either a string or a parsed object, depending on the provided response format.
 * @param {string} prompt - The prompt to send to the OpenAI API. Must be a non-empty string.
 * @param {string} [requestId=""] - An optional request identifier for logging purposes.
 * @param {AutoParseableResponseFormat<Record<string, any>> | null} [responseFormat=null] - An optional response format for parsing the API's response.
 * @returns {Promise<string | Record<string, any>>} - The OpenAI API response, either as a string or a parsed object.
 * @throws Will throw an error if the prompt is invalid, the token limit is exceeded, or if there are issues accessing the cache or calling the OpenAI API.
 * 
 * @function extractTypeScriptCode
 * @description Extracts TypeScript code from a given OpenAI API response. Searches for code blocks in the response and returns the code found within.
 * @param {string} response - The raw response from the OpenAI API.
 * @returns {string | null} - The extracted TypeScript code or null if no code block is found.
 */

import { ensureDir } from '@/utils/file.ts';
import OpenAI from "@openai";
import { type AutoParseableResponseFormat } from "@openai/parser";
import { config } from '@/config.ts';
import logger from '../logger.ts';
import { resolve } from '@std/path';
import { countTokens } from './tokenizer.ts';

const CACHE_DIR = resolve(config.cacheDir, 'llm');

// Ensure cache directory exists
await ensureDir(CACHE_DIR);
// Set restrictive permissions
await Deno.chmod(CACHE_DIR, 0o700);
logger.info(`Cache directory is ready at ${CACHE_DIR}`, { requestId: 'system' });

interface OpenAIMessage {
  role: string;
  content: string;
}

interface OpenAIChoice {
  message: OpenAIMessage;
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
}

interface CachedResponse {
  reply: string | Record<string, any>;
  timestamp: string;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000 * 7; // 7 days

const hashText = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};



export const callOpenAI = async (
  prompt: string, 
  requestId: string = "", 
  responseFormat: AutoParseableResponseFormat<Record<string, any>> | null = null,
): Promise<string | Record<string, any>> => {
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Invalid prompt: Prompt must be a non-empty string.');
  }
  const tokenCount = countTokens(prompt);
  if (tokenCount > config.openAI.maxTokens) {
    // Handle token limit exceeded, e.g., split prompt
    throw new Error(`Prompt with ${tokenCount} tokens exceeds maximum token limit ${config.openAI.maxTokens}`);
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: config.openAI.apiKey,
  });

  const cacheKeyInput = JSON.stringify({
    model: config.openAI.model,
    prompt,
    max_tokens: config.openAI.maxTokens,
    temperature: config.openAI.temperature,
  });
  const cacheKey = await hashText(cacheKeyInput);
  const cachedFilePath = resolve(CACHE_DIR, `${cacheKey}.json`);

  // Check cache
  try {
    const cachedData = await Deno.readTextFile(cachedFilePath);
    const cachedResponse: CachedResponse = JSON.parse(cachedData);
    const cachedTime = new Date(cachedResponse.timestamp).getTime();

    if (Date.now() - cachedTime < CACHE_DURATION) {
      logger.info(`Cache hit for prompt with hash ${cacheKey}.`, { requestId });
      logger.debug(`Cached response: ${JSON.stringify(cachedResponse.reply)}`, { requestId });
      return cachedResponse.reply;
    } else {
      logger.info(`Cache expired for prompt with hash ${cacheKey}.`, { requestId });
      // Optionally delete the expired cache file
      await Deno.remove(cachedFilePath);
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      logger.info(`Cache miss for prompt. Calling OpenAI API.`, { requestId });
    } else {
      logger.error(`Error accessing cache: ${error}`, { requestId });
      throw error;
    }
  }

  // Fetch from OpenAI using openai client
  try {

    let completion;
    let reply;

    if (responseFormat) {
      if (config.openAI.model === 'o1-mini') {
        completion = await openai.beta.chat.completions.parse({
          model: config.openAI.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          max_completion_tokens: config.openAI.maxTokens,
        });
      } else {
        completion = await openai.beta.chat.completions.parse({
          model: config.openAI.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: config.openAI.maxTokens,
          temperature: config.openAI.temperature,
          response_format: responseFormat,
        });
      }

      const completionMessage = completion.choices[0].message;

      // If the model refuses to respond, you will get a refusal message
      if (completionMessage.refusal) {
        logger.error(`Error completion refusal: ${completionMessage.refusal}`, { requestId });
        reply = completionMessage.refusal;
      } else {
        if (config.openAI.model === 'o1-mini') {
          reply = completionMessage.content;
        } else {
          reply = completionMessage.parsed;
        }
      }

    } else {
      if (config.openAI.model === 'o1-mini') {
        completion = await openai.chat.completions.create({
          model: config.openAI.model,
          messages: [
            { role: 'user', content: prompt },
          ],
          max_completion_tokens: config.openAI.maxTokens,
        });
      } else {
        completion = await openai.chat.completions.create({
          model: config.openAI.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: config.openAI.maxTokens,
          temperature: config.openAI.temperature,
        });
      }
      reply = completion.choices?.[0]?.message?.content?.trim();
    }
    
    if (!reply) {
      throw new Error('No reply received from OpenAI API');
    }

    // Cache the response
    const cacheData: CachedResponse = {
      reply,
      timestamp: new Date().toISOString(),
    };
    await Deno.writeTextFile(cachedFilePath, JSON.stringify(cacheData), { create: true, append: false });
    logger.info(`Response cached at ${cachedFilePath}.`, { requestId });
    logger.debug(`Cached response: ${reply}`, { requestId });

    return reply;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`OpenAI API error: ${error.message}`, { requestId });
      throw new Error(`OpenAI API error: ${error.message}`);
    } else {
      logger.error('An unknown error occurred while calling OpenAI API', { requestId });
      throw new Error('An unknown error occurred while calling OpenAI API');
    }
  }
};

/**
 * Extracts TypeScript code from the OpenAI API response.
 * 
 * @param {string} response - The raw response from the OpenAI API.
 * @returns {string | null} - The extracted TypeScript code or null if not found.
 */
export function extractTypeScriptCode(response: string): string | null {
  const regex = /```typescript\s*([\s\S]*)\s*```/;
  const match = response.match(regex);
  return match ? match[1] : null;
}