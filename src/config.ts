// config.ts

// Import the 'config' function from the Deno-compatible dotenv module
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


// Configuration object
export const config = {
  openAI:{
    apiKey: env.OPENAI_API_KEY || '',
    model: env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(env.OPENAI_MAX_TOKENS) || 150,
    temperature: parseFloat(env.OPENAI_TEMPERATURE) || 0.7,
  },
  markdownDir: env.MARKDOWN_DIR || '/workspace/markdown_example',
  maxLogEntryLength: 1000,
  rootDir: '/workspace',
};

