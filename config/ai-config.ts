// config/ai-config.ts
import { config } from 'https://deno.land/std@0.203.0/dotenv/mod.ts';

const env = config();

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
  apiKey: env.OPENAI_API_KEY,
  model: env.OPENAI_MODEL,
  maxTokens: parseInt(env.OPENAI_MAX_TOKENS) || 150,
  temperature: parseFloat(env.OPENAI_TEMPERATURE) || 0.7,
};
