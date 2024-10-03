// convertToPodcast.ts

import { createAudioFromText } from './tts.ts';
import logger from '../logger.ts';
import { resolve } from "https://deno.land/std@0.203.0/path/mod.ts";
import { mergeAudioFiles, MergeAudioParams } from './audioUtils.ts';
import type { Root } from "npm:@types/mdast";

// Initialize cache directory
const CACHE_DIR = resolve('../../tts-cache');

/**
 * Converts the Markdown content (in AST format) into an MP3 using OpenAI's Text-to-Speech API,
 * handling multiple speakers with distinct voices.
 * 
 * @param {object} tree - The Markdown AST.
 * @param {object} parameters - Operation parameters (unused).
 * @param {string} requestId - Unique identifier for the request.
 * @param {object} config - Contains the speaker mapping from the YAML front matter.
 * @returns {Promise<Uint8Array>} - The generated MP3 as a Uint8Array.
 */
export const convertToPodcast = async (
  tree: Root,
  parameters: any,
  requestId: string,
  config: any,
): Promise<Uint8Array> => {
  logger.debug('Starting conversion of Markdown AST to MP3', { requestId });

  try {
    // Extract speaker mapping from config
    const speakerMap = new Map<string, string>(
      config.speakers.map(({ Speaker, TTS_Voice }: { Speaker: string; TTS_Voice: string }) => [
        Speaker.toLowerCase(),
        TTS_Voice.toLowerCase(),
      ])
    );

    if (speakerMap.size === 0) {
      throw new Error('Speaker map is missing or empty in the config.');
    }

    // Extract conversation blocks from the AST
    const conversation = extractConversation(tree);

    // Generate audio for each block
    const audioFilePaths: string[] = [];
    let i = 0;
    for (const block of conversation) {
      const { speaker, text } = block as { speaker: string; text: string }; // Type assertion
      const voice = speakerMap.get(speaker.toLowerCase());
      if (!voice) {
        throw new Error(`No TTS voice found for speaker: ${speaker}`);
      }

      logger.debug(`Generating audio for speaker: ${speaker} with voice: ${voice}`, { requestId });

      // Generate audio file path for the text with the specified voice
      const mp3FilePath = await createAudioFromText(text, requestId + i, voice);
      audioFilePaths.push(mp3FilePath);
      i++;
    }

    // Define the output file path
    const outputFilePath = resolve(CACHE_DIR, `${requestId}_merged.mp3`);

    console.log("audioFilePaths", audioFilePaths);

    // Prepare parameters for the shared merge function
    const mergeParams: MergeAudioParams = {
      inputFiles: audioFilePaths,
      outputFile: outputFilePath,
      requestId: requestId,
      cacheDir: CACHE_DIR,
    };

    // Merge all audio files into a single MP3 using the shared function
    await mergeAudioFiles(mergeParams);

    // Read the merged MP3 file into a Uint8Array
    const mergedMp3Buffer = await Deno.readFile(outputFilePath);

    logger.debug('Successfully converted Markdown AST to MP3', { requestId });
    return mergedMp3Buffer;
  } catch (error: any) {
    logger.error('Error converting Markdown to MP3', { requestId, error: error.message });
    throw error;
  }
};

/**
 * Extracts conversation blocks from the Markdown AST.
 * Each block contains the speaker and their corresponding text.
 * 
 * @param {object} tree - The Markdown AST.
 * @returns {Array} - Array of conversation blocks with speaker and text.
 */
const extractConversation = (tree: Root) => {
  const conversation: any[] = []; // Specify type for conversation
  let currentSpeaker: string | null = null; // Explicitly define type for currentSpeaker
  let currentText: string[] = []; // Specify type for currentText

  //console.log(tree);

  tree.children.forEach(node => {
    if (node.type === 'paragraph') {
      node.children.forEach(child => {
        if (child.type === 'text') {
          //console.log(`currentText.push: ${child.value}`);
          currentText.push(child.value);
        }
      });
    }
    if (node.type === 'html') {
      const matchText = node.value.match(/^\s*<\!--\s*(.+?)\s*-->/i);
      if (matchText) {
        const speaker = matchText[1].trim(); // e.g., "Alice"
        //console.log(`Speaker: ${speaker}`);
        // Save the previous block
        if (currentSpeaker && currentText.length > 0) {
          conversation.push({
            speaker: currentSpeaker,
            text: currentText.join(' ').trim(),
          });
          currentText = [];
        }
        // Set new speaker
        currentSpeaker = speaker;
      } else {
        console.log(`No match ${node.value}`);
      }
    }
  });

  // Push the last block
  if (currentSpeaker && currentText.length > 0) {
    conversation.push({
      speaker: currentSpeaker,
      text: currentText.join(' ').trim(),
    });
  }

  return conversation;
};
