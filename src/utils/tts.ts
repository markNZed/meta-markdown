// Import necessary modules and dependencies
import { resolve, join } from "https://deno.land/std@0.203.0/path/mod.ts";
import logger from './logger.ts';
import { OpenAI } from 'https://deno.land/x/openai@v4.64.0/mod.ts';
import { config } from '../../config.ts';
import { ensureDir } from "https://deno.land/std@0.203.0/fs/mod.ts"; // Changed 'remove' to 'rm'
import { pLimit } from "https://deno.land/x/p_limit@v1.0.0/mod.ts";

// Define cache directory
const CACHE_DIR = resolve('../../tts-cache');

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
 * Merges multiple MP3 files into a single MP3 file using FFmpeg's concat demuxer.
 * 
 * @param {string[]} inputFiles - Array of input MP3 file paths.
 * @param {string} outputFile - The path for the merged output MP3 file.
 * @param {string} requestId - Unique identifier for the request.
 * @returns {Promise<void>}
 */
const mergeAudioFiles = async (
  inputFiles: string[],
  outputFile: string,
  requestId: string,
): Promise<void> => {
  logger.debug('Starting audio merging process', { requestId });

  try {
    if (inputFiles.length === 0) {
      throw new Error("No input files provided for merging.");
    }

    // Create a temporary file list for FFmpeg
    const listFilePath = join(CACHE_DIR, `${requestId}_filelist.txt`);
    const fileListContent = inputFiles.map(file => `file '${file}'`).join('\n');
    await Deno.writeTextFile(listFilePath, fileListContent);
    logger.debug(`Created FFmpeg file list at ${listFilePath}`, { requestId });

    // Execute FFmpeg command using Deno's subprocess
    const ffmpegCmd = [
      "ffmpeg",
      "-f",
      "concat",
      "-y",
      "-safe",
      "0",
      "-i",
      listFilePath,
      "-c",
      "copy",
      outputFile,
    ];

    logger.debug(`Running FFmpeg command: ${ffmpegCmd.join(' ')}`, { requestId });

    const process = Deno.run({
      cmd: ffmpegCmd,
      stdout: "piped",
      stderr: "piped",
    });

    const { code } = await process.status();

    const rawOutput = await process.output(); // stdout
    const rawError = await process.stderrOutput(); // stderr

    const output = new TextDecoder().decode(rawOutput);
    const errorOutput = new TextDecoder().decode(rawError);

    process.close();

    if (code !== 0) {
      logger.error(`FFmpeg failed with code ${code}: ${errorOutput}`, { requestId });
      throw new Error(`FFmpeg failed: ${errorOutput}`);
    }

    logger.info(`Audio merged successfully into ${outputFile}`, { requestId });

    // Optionally, delete the temporary file list
    await Deno.remove(listFilePath); // Changed 'remove' to 'rm'
    logger.debug(`Deleted temporary FFmpeg file list at ${listFilePath}`, { requestId });
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
          `Cache miss for chunk ${chunkNumber}/${chunks.length}. Requesting TTS from OpenAI.`,
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
