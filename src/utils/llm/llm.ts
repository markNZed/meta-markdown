/**
 * @module OpenAIInteraction
 * 
 * This module provides functions to interact with the OpenAI API and manage responses through caching.
 * 
 * @function callOpenAI
 * @param {CallOpenAIOptions} options - Options for calling the OpenAI API.
 * @param {string} options.prompt - The prompt to send to the OpenAI API. Must be a non-empty string.
 * @param {string} [options.requestId] - An optional identifier for tracking the request.
 * @param {AutoParseableResponseFormat<Record<string, any>>} [options.responseFormat] - Optional format for parsing the response.
 * @param {Partial<OpenAIConfig>} [options.configOverrides] - Optional overrides for the default OpenAI configuration.
 * @returns {Promise<string | Record<string, any>>} - Returns the response from the OpenAI API, either as a string or structured data.
 * 
 * @function extractTypeScriptCode
 * @param {string} response - The raw response from the OpenAI API.
 * @returns {string | null} - The extracted TypeScript code or null if not found.
 * 
 * Usage:
 * 
 * To call the OpenAI API, use the `callOpenAI` function with the necessary options. 
 * Example:
 * 
 * ```typescript
 * const response = await callOpenAI({
 *   prompt: "What is TypeScript?",
 *   requestId: "unique-request-id"
 * });
 * ```
 * 
 * To extract TypeScript code from the API response, use the `extractTypeScriptCode` function:
 * 
 * ```typescript
 * const code = extractTypeScriptCode(response);
 * ```
 
 * @hash d2650d0980bc61eae4821365d71c324cc4bebedceff5bccaca44f1a0d4772a04
 */

import { ensureDir } from '@/utils/file.ts';
import OpenAI from "@openai";
import { type AutoParseableResponseFormat } from "@openai/parser";
import { config, OpenAIConfig } from '@/config.ts';
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

interface CallOpenAIOptions {
  prompt: string;
  requestId?: string;
  responseFormat?: AutoParseableResponseFormat<Record<string, any>>;
  configOverrides?: Partial<OpenAIConfig>; // Allows overriding default config
}

export const callOpenAI = async (
  options: CallOpenAIOptions
): Promise<string | Record<string, any>> => {
  const {
    prompt,
    requestId = '',
    responseFormat = null,
    configOverrides = {},
  } = options;

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Invalid prompt: Prompt must be a non-empty string.');
  }

  // Merge default config with any overrides
  const mergedConfig: OpenAIConfig = {
    ...config.openAI,
    ...configOverrides,
  };
  
  const tokenCount = countTokens(prompt);
  if (tokenCount > mergedConfig.maxInputTokens) {
    // Handle token limit exceeded, e.g., split prompt
    throw new Error(`Prompt with ${tokenCount} tokens exceeds maximum token limit ${mergedConfig.max_completion_tokens}`);
  }

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: mergedConfig.apiKey,
  });

  const cacheKeyInput = JSON.stringify({
    model: mergedConfig.model,
    prompt,
    max_tokens: mergedConfig.max_completion_tokens,
    temperature: mergedConfig.temperature,
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
      if (mergedConfig.model === 'o1-mini') {
        completion = await openai.beta.chat.completions.parse({
          model: mergedConfig.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          max_completion_tokens: mergedConfig.max_completion_tokens,
        });
      } else {
        completion = await openai.beta.chat.completions.parse({
          model: mergedConfig.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: mergedConfig.max_completion_tokens,
          temperature: mergedConfig.temperature,
          response_format: responseFormat,
        });
      }

      const completionMessage = completion.choices[0].message;

      // If the model refuses to respond, you will get a refusal message
      if (completionMessage.refusal) {
        logger.error(`Error completion refusal: ${completionMessage.refusal}`, { requestId });
        reply = completionMessage.refusal;
      } else {
        if (mergedConfig.model === 'o1-mini') {
          reply = completionMessage.content;
        } else {
          reply = completionMessage.parsed;
        }
      }

    } else {
      if (mergedConfig.model === 'o1-mini') {
        completion = await openai.chat.completions.create({
          model: mergedConfig.model,
          messages: [
            { role: 'user', content: prompt },
          ],
          max_completion_tokens: mergedConfig.max_completion_tokens,
        });
      } else {
        completion = await openai.chat.completions.create({
          model: mergedConfig.model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: mergedConfig.max_completion_tokens,
          temperature: mergedConfig.temperature,
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

export function extractCodeBlock(text: string, language: string): string | null {
  const regex = new RegExp('```\\s*' + language + '\\s*([\\s\\S]*?)```', 'i');
  const match = regex.exec(text);
  if (match && match[1]) {
      return match[1].trim();
  }
  return null;
}


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