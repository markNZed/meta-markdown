import { assertEquals, assertThrows, assert } from "https://deno.land/std@0.203.0/testing/asserts.ts";
import { createAudioFromText } from "@/utils/audio/tts.ts"; 
import { OpenAI } from "https://deno.land/x/openai@v4.64.0/mod.ts";

// Mock logger and other dependencies
const mockLogger = {
  info: (_msg: string, _meta?: any) => {},
  error: (_msg: string, _meta?: any) => {},
};

// Define mockOpenAI with type 'any' to bypass type checks
const mockOpenAI: any = {
  audio: {
    speech: {
      create: (_params: any) => Promise.resolve({ body: new ReadableStream() }),
    },
    transcriptions: {
      create: (_params: any) => Promise.resolve({
        text: 'mock transcription text',
        parsedPromise: Promise.resolve({ transcription: 'mock transcription' }),
        responsePromise: Promise.resolve({ response: 'mock response' }),
        parseResponse: (_response: any) => Promise.resolve({ transcription: 'mock transcription' }),
        _thenUnwrap: (_callback: any) => Promise.resolve({ transcription: 'mock transcription' }),
      }),
      _client: {}, // Required property
    },
    translations: {
      create: (_params: any) => Promise.resolve({
        text: 'mock translation text',
      }),
      _client: {}, // Required property
    },
    _client: {}, // Required property
  },
};

// Define mockOpenAIInvalid similarly if needed
const mockOpenAIInvalid: any = {
  audio: {
    speech: {
      create: (_params: any) => Promise.resolve({ body: null }), // Invalid response
    },
    transcriptions: {
      // Intentionally incomplete to simulate invalid mock
      _client: {},
    },
    translations: {
      // Intentionally incomplete to simulate invalid mock
      _client: {},
    },
    _client: {},
  },
};

Deno.test("createAudioFromText - handles short text", async () => {
  const text = "This is a short text.";
  const requestId = "test1";
  const voice = "alloy";

  // Replace the OpenAI client with a mock using type assertion
  const originalOpenAI = OpenAI.prototype.audio;
  OpenAI.prototype.audio = mockOpenAI.audio as any;

  try {
    const result = await createAudioFromText(text, requestId, voice);
    assert(result.endsWith(".mp3"), "Expected an MP3 file path.");
  } finally {
    // Restore the original OpenAI client
    OpenAI.prototype.audio = originalOpenAI;
  }
});

Deno.test("createAudioFromText - handles long text with multiple chunks", async () => {
  const text = "Long text ".repeat(1000); // Create a very long text
  const requestId = "test2";
  const voice = "alloy";

  // Replace the OpenAI client with a mock using type assertion
  const originalOpenAI = OpenAI.prototype.audio;
  OpenAI.prototype.audio = mockOpenAI.audio as any;

  try {
    const result = await createAudioFromText(text, requestId, voice);
    assert(result.endsWith(".mp3"), "Expected an MP3 file path.");
  } finally {
    // Restore the original OpenAI client
    OpenAI.prototype.audio = originalOpenAI;
  }
});

Deno.test("createAudioFromText - handles cache hit", async () => {
  // Mock Deno.stat to simulate a cache hit
  const originalStat = Deno.stat;
  Deno.stat = async (_path: string | URL) => ({ isFile: true } as Deno.FileInfo);

  const text = "This is a cached text.";
  const requestId = "test3";
  const voice = "alloy";

  // Replace the OpenAI client with a mock using type assertion
  const originalOpenAI = OpenAI.prototype.audio;
  OpenAI.prototype.audio = mockOpenAI.audio as any;

  try {
    const result = await createAudioFromText(text, requestId, voice);
    assert(result.endsWith(".mp3"), "Expected an MP3 file path.");
  } finally {
    // Restore the original functions
    Deno.stat = originalStat;
    OpenAI.prototype.audio = originalOpenAI;
  }
});

Deno.test("createAudioFromText - error on empty chunk", async () => {
  const text = ""; // Empty text should raise an error
  const requestId = "test4";
  const voice = "alloy";

  await assertThrows(
    async () => {
      await createAudioFromText(text, requestId, voice);
    },
    Error,
    "Failed to generate MP3 from text."
  );
});

Deno.test("createAudioFromText - error on invalid OpenAI response", async () => {
  // Replace the OpenAI client with an invalid mock using type assertion
  const originalOpenAI = OpenAI.prototype.audio;
  OpenAI.prototype.audio = mockOpenAIInvalid.audio as any;

  const text = "This is a text.";
  const requestId = "test5";
  const voice = "alloy";

  await assertThrows(
    async () => {
      await createAudioFromText(text, requestId, voice);
    },
    Error,
    "Failed to generate MP3 from text."
  );

  // Restore the original OpenAI client
  OpenAI.prototype.audio = originalOpenAI;
});
