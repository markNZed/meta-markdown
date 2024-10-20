/**
 * @module Config
 * 
 * This module loads environment configuration settings from a .env file and merges them with system environment variables.
 * It exports the configuration for the application, which includes settings for OpenAI integration and directory paths.
 * 
 * @typedef {Object} OpenAIConfig
 * @property {string} apiKey - The API key for OpenAI.
 * @property {string} model - The model to be used for OpenAI requests.
 * @property {number} max_completion_tokens - The maximum number of tokens for OpenAI completions.
 * @property {number} [temperature] - The sampling temperature for OpenAI completions (optional).
 * @property {number} maxInputTokens - The maximum number of input tokens for OpenAI requests.
 * 
 * @typedef {Object} AppConfig
 * @property {OpenAIConfig} openAI - Configuration settings for OpenAI.
 * @property {string} markdownDir - The directory path for markdown files.
 * @property {number} maxLogEntryLength - The maximum length of log entries.
 * @property {string} rootDir - The root directory for the application.
 * @property {string} cacheDir - The directory path for caching.
 * 
 * @constant {AppConfig} config - The merged configuration object containing application settings.
 * 
 * @example
 * // Importing the config in another module
 * import { config } from '@/path/to/this/module';
 * 
 * console.log(config.openAI.apiKey); // Access the OpenAI API key
 
 * @hash 4da32a734ef9a7dff3959b9ea7c8b1de26376a0ece2714df5febaf9fdd35eadb
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

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  max_completion_tokens: number;
  // Add any new configuration entries here
  temperature?: number; // Example of a new config entry
  maxInputTokens: number;
}

export interface AppConfig {
  openAI: OpenAIConfig;
  markdownDir: string;
  maxLogEntryLength: number;
  rootDir: string;
  cacheDir: string;
}

// Configuration object
export const config: AppConfig = {
  openAI:{
    apiKey: env.OPENAI_API_KEY || '',
    model: env.OPENAI_MODEL || 'gpt-4o-mini',
    max_completion_tokens: parseInt(env.OPENAI_MAX_COMPLETION_TOKENS) || 2048,
    temperature: parseFloat(env.OPENAI_TEMPERATURE) || 0.7,
    maxInputTokens: parseInt(env.OPENAI_MAX_INPUT_TOKENS) || 4096,
  },
  markdownDir: env.MARKDOWN_DIR || resolve(ROOT_DIR, 'markdown_example'),
  maxLogEntryLength: 1000,
  rootDir: ROOT_DIR,
  cacheDir: resolve(ROOT_DIR, 'cache'),
};

