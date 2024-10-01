import { ensureDir } from "https://deno.land/std@0.203.0/fs/mod.ts";
import OpenAI from "https://deno.land/x/openai@v4.66.1/mod.ts";
import { config } from '../../config.ts';
import logger from './logger.ts';
import { resolve } from '@std/path';

// Define cache directory relative to module location
const __dirname = new URL('.', import.meta.url).pathname;
const CACHE_DIR = resolve(__dirname, '../../llm-cache');

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
  reply: string;
  timestamp: string;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const hashText = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openAI.apiKey,
});

export const callOpenAI = async (prompt: string, requestId: string): Promise<string> => {
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw new Error('Invalid prompt: Prompt must be a non-empty string.');
  }

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

    const completion = await openai.chat.completions.create({
      model: config.openAI.model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: config.openAI.maxTokens,
      temperature: config.openAI.temperature,
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    
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