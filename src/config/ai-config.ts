import { load } from "dotenv";

// Load .env file if it exists
const envFromFile = await load({ envPath: '../../.env' });

// Merge system environment variables with those from the .env file
const env = {
  ...envFromFile, // Variables from .env file
  ...Deno.env.toObject() // System environment variables
};

// Now you can use the env variables
export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequestBody {
  model: string;
  messages: OpenAIMessage[];
  max_tokens: number;
  temperature: number;
}

export interface OpenAIChoice {
  message: OpenAIMessage;
  finish_reason: string;
  index: number;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIErrorResponse {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

export const openAI: OpenAIConfig = {
  apiKey: env.OPENAI_API_KEY || '',
  model: env.OPENAI_MODEL || 'gpt-4o-mini',
  maxTokens: parseInt(env.OPENAI_MAX_TOKENS) || 150,
  temperature: parseFloat(env.OPENAI_TEMPERATURE) || 0.7,
};

export const markdownDir = env.MARKDOWN_DIR || '/workspace/markdown_example';
