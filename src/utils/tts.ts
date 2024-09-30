import { resolve } from "https://deno.land/std@0.203.0/path/mod.ts";
import logger from './logger.ts';
import { OpenAI, toFile } from 'https://deno.land/x/openai@v4.64.0/mod.ts';
import { config } from '../../config.ts';
import { ffmpeg } from "https://deno.land/x/deno_ffmpeg@v3.1.0/mod.ts";

// Define cache directory
const CACHE_DIR = resolve('../../tts-cache');

// Ensure cache directory exists
import { ensureDir } from "https://deno.land/std@0.203.0/fs/mod.ts";
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
 * Merges multiple MP3 files into a single MP3 file using deno_ffmpeg.
 * 
 * @param {string[]} inputFiles - Array of input MP3 file paths.
 * @param {string} outputFile - The path for the merged output MP3 file.
 * @param {string} requestId - Unique identifier for the request.
 * @returns {Promise<void>}
 */
const mergeAudioFiles = async (inputFiles: string[], outputFile: string, requestId: string): Promise<void> => {
  logger.debug('Starting audio merging process', { requestId });

  try {
    // Create an ffmpeg instance
    let ffmpegProcess = ffmpeg({
      input: inputFiles[0],   // Set the first input file
      ffmpegDir: "/usr/bin/ffmpeg",  // Path to the ffmpeg binary
    });

    // Add the rest of the input files
    inputFiles.slice(1).forEach((file) => {
      ffmpegProcess = ffmpegProcess.addInput(file);
    });

    // Chain methods and save the output
    await ffmpegProcess.save(outputFile);

    logger.info(`Audio merged successfully into ${outputFile}`, { requestId });
  } catch (error) {
    logger.error(`FFmpeg error during merging: ${error}`, { requestId });
    throw new Error(`FFmpeg failed: ${error}`);
  }
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

    const audioFilePaths: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkHash = await hashText(chunk + voice);
      const cachedFilePath = resolve(CACHE_DIR, `${chunkHash}.mp3`);

      // Check if the audio chunk is already cached
      try {
        await Deno.stat(cachedFilePath);
        logger.info(
          `Cache hit for chunk ${i + 1}/${chunks.length} with hash ${chunkHash}.`,
          { requestId },
        );
        audioFilePaths.push(cachedFilePath);
      } catch {
        logger.info(
          `Cache miss for chunk ${i + 1}/${chunks.length}. Requesting TTS from OpenAI.`,
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
        for await (const chunk of response.body) {
          chunksArray.push(chunk);
        }
        const audioBuffer = new Uint8Array(
          chunksArray.reduce((acc, curr) => acc + curr.length, 0),
        );
        let offset = 0;
        for (const chunk of chunksArray) {
          audioBuffer.set(chunk, offset);
          offset += chunk.length;
        }

        // Write the MP3 chunk to the cache
        await Deno.writeFile(cachedFilePath, audioBuffer);
        logger.info(`MP3 chunk saved to cache at ${cachedFilePath}`, {
          requestId,
        });

        audioFilePaths.push(cachedFilePath);
      }
    }

    // Define the output file path
    const outputFile = resolve(CACHE_DIR, `${requestId}_merged.mp3`);

    // Merge all audio files into a single MP3
    await mergeAudioFiles(audioFilePaths, outputFile, requestId);

    return outputFile;
  } catch (error: any) {
    logger.error('Error in TTS process', { requestId, error: error.message });
    throw new Error('Failed to generate MP3 from text.');
  }
};
