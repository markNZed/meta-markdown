/**
 * This module provides utility functions for audio processing.
 *
 * @module AudioUtils
 * 
 * @function processAudio
 * @param {string} filePath - The path to the audio file to be processed.
 * @param {Object} options - Options for processing the audio.
 * @param {boolean} options.normalize - Whether to normalize the audio volume.
 * @returns {Promise<string>} A promise that resolves to the path of the processed audio file.
 *
 * @function analyzeAudio
 * @param {string} filePath - The path to the audio file to be analyzed.
 * @returns {Promise<Object>} A promise that resolves to an object containing analysis results such as duration and bitrate.
 *
 * @example
 * import { processAudio, analyzeAudio } from '@/utils/audio/audioUtils';
 *
 * async function main() {
 *   const processedPath = await processAudio('path/to/audio.mp3', { normalize: true });
 *   const analysis = await analyzeAudio(processedPath);
 *   console.log(analysis);
 * }
 */

