/**
 * This module provides a function to convert text to speech using OpenAI's Text-to-Speech (TTS) API 
 * with caching and chunk management for texts exceeding 4096 characters.
 *
 * Exported Function:
 * 
 * - `createAudioFromText(text: string, requestId: string, voice: string): Promise<string>`
 *   - Converts the given text to an MP3 file using the specified voice.
 *   - Text longer than 4096 characters is split into smaller chunks.
 *   - Each chunk is sent to OpenAI's TTS API; results are cached to reduce redundant API calls.
 *   - If the audio for a chunk is already cached, it retrieves the cached version.
 *   - The resulting MP3 files from each chunk are merged into a single MP3 file.
 *   - Returns the file path of the final MP3.
 * 
 * How to Use:
 * 
 * 1. Call `createAudioFromText` with the desired text, a unique request ID for logging, and a voice 
 *    identifier ('alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer').
 * 2. Handle the returned promise, which resolves to the path of the generated MP3 file.
 * 
 * Dependencies:
 * 
 * - Uses OpenAI's TTS API, requiring a valid API key in the configuration (`config.openAI.apiKey`).
 * - Caches audio chunks in a directory specified by `config.cacheDir`.
 * - Utilizes `mergeAudioFiles` from `./audioUtils.ts` to combine audio chunks.
 */

import { resolve } from '@std/path';
import logger from '@/utils/logger.ts';
import OpenAI from "@openai";
import { config } from '@/config.ts';
import { ensureDir } from '@/utils/file.ts';
import { pLimit } from "https://deno.land/x/p_limit@v1.0.0/mod.ts";

// Import the shared merge function
import { mergeAudioFiles, MergeAudioParams } from './audioUtils.ts';

// Initialize cache directory
const CACHE_DIR = resolve(config.cacheDir, 'tts');

// Ensure cache directory exists
await ensureDir(CACHE_DIR);
logger.info(`Cache directory is ready at ${CACHE_DIR}`, { requestId: 'system' });

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: config.openAI.apiKey,
});

/**
 * Generates a SHA-256 hash for the given text using Deno's SubtleCrypto.
 *
 * @param {string} text - The input text to hash.
 * @returns {Promise<string>} - The resulting hash in hexadecimal format.
 */
const hashText = async (text: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Splits the input text into chunks not exceeding the specified maximum length.
 * It attempts to split at sentence boundaries to maintain coherence.
 *
 * @param {string} text - The input text to split.
 * @param {number} maxLength - The maximum length of each chunk.
 * @returns {string[]} - An array of text chunks.
 */
const splitTextIntoChunks = (text: string, maxLength: number = 4096): string[] => {
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      // If single sentence exceeds maxLength, split it forcibly
      if (sentence.length > maxLength) {
        const parts = sentence.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [];
        chunks.push(...parts);
      } else {
        currentChunk += sentence;
      }
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

/**
 * Converts text to MP3 using OpenAI's Text-to-Speech (TTS) API with caching.
 * Handles texts longer than 4096 characters by splitting them into smaller chunks.
 *
 * @param {string} text - The plain text to convert to speech.
 * @param {string} requestId - The request ID for logging.
 * @param {string} voice - The voice to use for TTS.
 * @returns {Promise<string>} - The path to the concatenated MP3 file.
 */
export const createAudioFromText = async (
  text: string,
  requestId: string,
  voice: string,
): Promise<string> => {
  try {
    logger.info(`Processing TTS request.`, { requestId });

    // Split text into chunks if necessary
    const chunks = splitTextIntoChunks(text, 4096);
    logger.info(`Text split into ${chunks.length} chunk(s).`, { requestId });

    // Initialize p-limit with concurrency of 10
    const limit = pLimit(10);

    // Function to process each chunk
    const processChunk = async (chunk: string, index: number): Promise<string> => {
      const chunkNumber = index + 1;
      const chunkHash = await hashText(chunk + voice);
      const cachedFilePath = resolve(CACHE_DIR, `${chunkHash}.mp3`);

      // Check if the audio chunk is already cached
      try {
        await Deno.stat(cachedFilePath);
        logger.info(
          `Cache hit for chunk ${chunkNumber}/${chunks.length} with hash ${chunkHash}.`,
          { requestId },
        );
        return cachedFilePath;
      } catch {
        logger.info(
          `Cache miss for chunk ${chunkNumber}/${chunks.length} ${chunkHash} Requesting TTS from OpenAI.`,
          { requestId },
        );

        if (!chunk || chunk.trim() === '') {
          throw new Error(`Invalid chunk for TTS processing: ${chunk}`);
        }

        // Make the API request to generate speech using OpenAI's library
        const response = await openai.audio.speech.create({
          model: 'tts-1',
          voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
          input: chunk,
        });

        if (!response || !response.body) {
          throw new Error('Invalid response from OpenAI TTS API.');
        }

        // Assuming response.body is a ReadableStream of the MP3 data
        const chunksArray: Uint8Array[] = [];
        for await (const chunkData of response.body) {
          chunksArray.push(chunkData);
        }

        // Concatenate all chunks into a single buffer
        const totalLength = chunksArray.reduce((acc, curr) => acc + curr.length, 0);
        const audioBuffer = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunkData of chunksArray) {
          audioBuffer.set(chunkData, offset);
          offset += chunkData.length;
        }

        // Write the MP3 chunk to the cache
        await Deno.writeFile(cachedFilePath, audioBuffer);
        logger.info(`MP3 chunk saved to cache at ${cachedFilePath}`, {
          requestId,
        });

        return cachedFilePath;
      }
    };

    // Process all chunks with concurrency limit
    const audioFilePaths = await Promise.all(
      chunks.map((chunk, index) => limit(() => processChunk(chunk, index)))
    );

    console.log("audioFilePaths", audioFilePaths);

    if (audioFilePaths.length === 1) {
      return audioFilePaths[0]; 
    } else {
      // Define the output file path
      const outputFilePath = resolve(CACHE_DIR, `${requestId}_merged.mp3`);
      // Prepare parameters for the shared merge function
      const mergeParams: MergeAudioParams = {
        inputFiles: audioFilePaths,
        outputFile: outputFilePath,
        requestId: requestId,
        cacheDir: CACHE_DIR,
      };
      // Merge all audio files into a single MP3 using the shared function
      await mergeAudioFiles(mergeParams);
      logger.info(`Audio merged successfully into ${outputFilePath}`, { requestId });
      return outputFilePath;
    }
  } catch (error: any) {
    logger.error('Error in TTS process', { requestId, error: error.message });
    throw new Error('Failed to generate MP3 from text.');
  }
};
