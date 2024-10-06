/**
 * @fileoverview Configuration module for handling environment variables and default settings.
 * 
 * This module imports environment variables from a `.env` file and the system,
 * and provides a configuration object for use in applications. The configuration
 * includes settings for OpenAI API integration, directory paths, and logging.
 *
 * @example
 * import { config } from '@/path/to/this/module';
 * 
 * console.log(config.openAI.apiKey);  // Access OpenAI API key
 * console.log(config.markdownDir);    // Get directory for markdown files
 *
 * @exports
 * @constant {Object} config - Configuration object with the following properties:
 *   @property {Object} openAI - OpenAI API configuration
 *     @property {string} apiKey - API key for OpenAI
 *     @property {string} model - Model name for OpenAI (default: 'gpt-4o')
 *     @property {number} maxTokens - Maximum number of tokens (default: 150)
 *     @property {number} temperature - Sampling temperature for OpenAI (default: 0.7)
 *   @property {string} markdownDir - Directory path for markdown files
 *   @property {number} maxLogEntryLength - Maximum length for log entries
 *   @property {string} rootDir - Root directory path
 *   @property {string} cacheDir - Directory path for cache files
 */

import { config as envConfig } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { dirname, fromFileUrl, resolve } from "https://deno.land/std@0.224.0/path/mod.ts";

// Resolve the path relative to the current script file
const __dirname = dirname(fromFileUrl(import.meta.url));
const envPath = resolve(__dirname, '../.env');  // Adjust the path

const envFromFile = envConfig({ path: envPath });

// Merge system environment variables with those from the .env file
const env = {
  ...envFromFile, // Variables from .env file
  ...Deno.env.toObject(), // System environment variables
};

const ROOT_DIR = env.ROOT_DIR || '/workspace';

// Configuration object
export const config = {
  openAI:{
    apiKey: env.OPENAI_API_KEY || '',
    model: env.OPENAI_MODEL || 'gpt-4o',
    maxTokens: parseInt(env.OPENAI_MAX_TOKENS) || 150,
    temperature: parseFloat(env.OPENAI_TEMPERATURE) || 0.7,
  },
  markdownDir: env.MARKDOWN_DIR || resolve(ROOT_DIR, 'markdown_example'),
  maxLogEntryLength: 1000,
  rootDir: ROOT_DIR,
  cacheDir: resolve(ROOT_DIR, 'cache'),
};

