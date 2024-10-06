/**
 * This module provides configuration settings for an application that integrates with OpenAI's API.
 * It exports a configuration object, `config`, which contains settings loaded from environment
 * variables and a `.env` file. These settings are useful for managing the application's integration
 * with OpenAI, as well as some directory paths and limits used within the application.
 *
 * The configuration is structured in the following way:
 *
 * - `openAI`: Contains settings specific to the OpenAI API, such as:
 *   - `apiKey`: The API key used for authentication with OpenAI.
 *   - `model`: The OpenAI model name to be used for requests.
 *   - `max_completion_tokens`: The maximum number of tokens for OpenAI's completion.
 *   - `temperature`: (optional) The temperature parameter for OpenAI's responses.
 *   - `maxInputTokens`: The maximum number of input tokens allowed.
 *
 * - `markdownDir`: The directory path where markdown files are stored.
 * - `maxLogEntryLength`: The maximum length allowed for log entries.
 * - `rootDir`: The root directory of the workspace.
 * - `cacheDir`: The directory path where cache files are stored.
 *
 * To use the configuration, simply import the `config` object from this module and access the
 * desired properties as needed in your application.
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
    model: env.OPENAI_MODEL || 'gpt-4o',
    max_completion_tokens: parseInt(env.OPENAI_MAX_COMPLETION_TOKENS) || 150,
    temperature: parseFloat(env.OPENAI_TEMPERATURE) || 0.7,
    maxInputTokens: parseInt(env.OPENAI_MAX_INPUT_TOKENS) || 2048,
  },
  markdownDir: env.MARKDOWN_DIR || resolve(ROOT_DIR, 'markdown_example'),
  maxLogEntryLength: 1000,
  rootDir: ROOT_DIR,
  cacheDir: resolve(ROOT_DIR, 'cache'),
};

