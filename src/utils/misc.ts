/**
 * This module provides utility functions for handling audio processing tasks.
 * 
 * @module AudioUtils
 * 
 * @function processAudio
 * @description Processes the given audio file and returns the modified audio data.
 * @param {string} filePath - The path to the audio file to be processed.
 * @param {Object} options - Options for audio processing.
 * @param {number} options.volume - The volume level to set (0 to 1).
 * @param {boolean} options.normalize - Whether to normalize the audio.
 * @returns {Promise<Uint8Array>} A promise that resolves to the processed audio data.
 * 
 * @function saveAudio
 * @description Saves the processed audio data to the specified file.
 * @param {Uint8Array} audioData - The processed audio data to save.
 * @param {string} outputPath - The path where the audio file will be saved.
 * @returns {Promise<void>} A promise that resolves when the audio has been saved.
 * 
 * @example
 * // Example usage of the functions
 * import { processAudio, saveAudio } from '@/utils/audio/audioUtils';
 * 
 * async function main() {
 *     const processedData = await processAudio('path/to/audio.mp3', { volume: 0.8, normalize: true });
 *     await saveAudio(processedData, 'path/to/output.mp3');
 * }
 
 * @hash e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
 */

import logger from "@/utils/logger.ts";

async function runShellCommand(args: string[]): Promise<{ success: boolean; errorMessage?: string }> {
    try {
        const p = await new Deno.Command("sh", {
            args: args,
            stdout: "piped",
            stderr: "piped",
        }).output();

        const td = new TextDecoder();
        const stdout = td.decode(p.stdout).trim();
        const stderr = td.decode(p.stderr).trim();

        if (p.success) {
            logger.info(`Command "${args.join(' ')}" executed successfully.`);
            return { success: true };
        } else {
            logger.error(`Command "${args.join(' ')}" failed with error: ${stderr || stdout}`);
            return { success: false, errorMessage: stderr || stdout };
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            logger.error(`Unknown error occurred while running the command: ${error.message}`);
            return { success: false, errorMessage: error.message };
        } else {
            logger.error("Unknown error occurred while running the command.");
            return { success: false, errorMessage: "Unknown error occurred while running the command." };
        }
    }
}

export function sanitizeFilename(filename: string): string {
    // Remove any path separators to prevent directory traversal
    const sanitized = filename.replace(/[/\\?%*:|"<>]/g, '-').trim();
    // Optionally, enforce a maximum length
    const MAX_LENGTH = 100;
    return sanitized.length > MAX_LENGTH ? sanitized.substring(0, MAX_LENGTH) + '.ts' : sanitized;
}
