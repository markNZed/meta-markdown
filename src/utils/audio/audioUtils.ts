/**
 * @module AudioMerger
 * 
 * This module provides functionality to merge multiple audio files into a single audio file using FFmpeg's concat demuxer.
 * 
 * @export
 * 
 * @function mergeAudioFiles
 * @param {MergeAudioParams} params - The parameters for merging audio files.
 * @param {string[]} params.inputFiles - An array of paths to the input audio files to be merged.
 * @param {string} params.outputFile - The path where the merged audio file will be saved.
 * @param {string} params.requestId - A unique identifier for the merge request, used for logging purposes.
 * @param {string} params.cacheDir - The directory where temporary files will be created during the merge process.
 * @returns {Promise<void>} A promise that resolves when the audio files have been successfully merged.
 * 
 * @throws {Error} Throws an error if no input files are provided, if FFmpeg fails to execute, or if any other error occurs during the merging process.
 * 
 * @example
 * import { mergeAudioFiles } from '@/path/to/module';
 * 
 * const params = {
 *   inputFiles: ['audio1.mp3', 'audio2.mp3'],
 *   outputFile: 'merged.mp3',
 *   requestId: '123456',
 *   cacheDir: '/tmp'
 * };
 * 
 * mergeAudioFiles(params)
 *   .then(() => console.log('Merging completed successfully.'))
 *   .catch(error => console.error('Error during merging:', error));
 
 * @hash 531fc4ea8bc4285f58ca37eb719860d5222b7f90b495ddd7e64725fe8f00952f
 */

import { join } from "https://deno.land/std@0.203.0/path/mod.ts";
import logger from '../logger.ts';

export interface MergeAudioParams {
  inputFiles: string[];
  outputFile: string;
  requestId: string;
  cacheDir: string;
}

/**
 * Merges multiple audio files into a single audio file using FFmpeg's concat demuxer.
 * Supports different audio formats by adjusting FFmpeg parameters if needed.
 * 
 * @param {MergeAudioParams} params - Parameters for merging audio files.
 * @returns {Promise<void>}
 */
export const mergeAudioFiles = async ({
  inputFiles,
  outputFile,
  requestId,
  cacheDir,
}: MergeAudioParams): Promise<void> => {
  logger.debug('Starting audio merging process', { requestId });

  try {

    if (inputFiles.length === 0) {
      throw new Error("No input files provided for merging.");
    }

    // Create a temporary file list for FFmpeg
    const listFilePath = join(cacheDir, `${requestId}_filelist.txt`);
    const fileListContent = inputFiles.map(file => `file '${file}'`).join('\n');
    await Deno.writeTextFile(listFilePath, fileListContent);
    logger.debug(`fileListContent ${fileListContent}`, { requestId });
    logger.debug(`Created FFmpeg file list at ${listFilePath}`, { requestId });

    // Prepare FFmpeg command arguments
    const ffmpegArgs = [
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

    logger.debug(`Running FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`, { requestId });

    // Execute FFmpeg command using Deno's subprocess with captured stderr
    const command = new Deno.Command("ffmpeg", {
      args: ffmpegArgs,
      stderr: "piped",  // Capture stderr
      stdout: "null",   // Ignore stdout or set to "piped" if you need it
    });

    // Execute the command and capture the output
    const output = await command.output();

    // Decode stderr output
    const errorOutput = new TextDecoder().decode(output.stderr).trim();

    // Check the exit code
    if (output.code !== 0) {
      logger.error(`FFmpeg failed with code ${output.code}: ${errorOutput}`, { requestId });
      throw new Error(`FFmpeg failed: ${errorOutput}`);
    }

    logger.info(`Audio merged successfully into ${outputFile}`, { requestId });

    // Delete the temporary file list
    await Deno.remove(listFilePath);
    logger.debug(`Deleted temporary FFmpeg file list at ${listFilePath}`, { requestId });
  } catch (error) {
    logger.error(`FFmpeg error during merging: ${error}`, { requestId });
    throw new Error(`FFmpeg failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};
