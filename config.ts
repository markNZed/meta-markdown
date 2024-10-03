// config.ts

// Import the 'config' function from the Deno-compatible dotenv module
import { config as envConfig } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

// Load environment variables from the .env file
const envFromFile = envConfig({ path: '.env' });

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
};

