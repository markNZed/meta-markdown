/**
 * @module DocumentationGenerator
 * 
 * This module provides functionality to generate JSDoc comments for TypeScript files.
 * It includes the following exported functions:
 * 
 * - `generateDocumentationForFile(filePath: string): Promise<void>`: 
 *   Generates and updates JSDoc comments for the specified TypeScript file. 
 *   It reads the file, checks for existing comments, computes a hash to detect changes, 
 *   and generates new documentation using an AI model. The updated content is then 
 *   written back to the file. 
 * 
 *   **Usage**: Call this function with the absolute path to the TypeScript file you wish 
 *   to document.
 * 
 * - `main(): Promise<void>`: 
 *   The main entry point for the script. It gathers all relevant TypeScript files and 
 *   invokes `generateDocumentationForFile` for each file. In development mode, it can 
 *   process a specific file or the first file in the list. 
 * 
 *   **Usage**: This function is called automatically if the script is run directly. 
 *   It processes all TypeScript files in production mode or a single file in development mode.
 
 * @hash 24d3d0b939f65c33dc248d46687342c1d3ef0262a674cfc4a77aa37080f74e7f
 */

import { listTsFiles } from './blocks/listTsFiles.ts'; // Import the function to list TypeScript files
import { callOpenAI } from '@/utils/llm/llm.ts';
import logger from '@/utils/logger.ts';
import { resolvePath } from '@/utils/file.ts';

// Toggle Development Mode: Set to true during development to process a single file
const DEV_MODE = false;

// Optional: Specify a particular file to process in development mode
const SPECIFIC_FILE_PATH = './src/utils/logger.ts'; // Adjust this path as needed

/**
 * Regular expression to match existing header comments (single-line and multi-line)
 * before any import statements.
 */
const HEADER_COMMENT_REGEX = /^(?:\s*(?:\/\/.*|\/\*[\s\S]*?\*\/))+\s*/;

/**
 * Regular expression to extract the hash from the JSDoc comment.
 * Ensures that the hash is exactly 64 hexadecimal characters (SHA-256).
 */
const HASH_REGEX = /@hash\s+([a-fA-F0-9]{64})/;

/**
 * Extracts the first JSDoc comment block from a given text.
 * Assumes that the JSDoc comment is not enclosed within markdown code blocks.
 *
 * @param response - The raw text response from the LLM.
 * @returns The extracted JSDoc comment block as a string, or null if not found.
 */
function extractJSDocComment(response: string): string | null {
  // Regular expression to match JSDoc comments
  const jsDocRegex = /\/\*\*[\s\S]*?\*\//;

  const jsDocMatch = response.match(jsDocRegex);
  return jsDocMatch ? jsDocMatch[0] : null;
}

/**
 * Executes a Deno syntax check on the specified file.
 * @param filePath The path to the TypeScript file to check.
 * @returns A promise that resolves to true if syntax is valid, false otherwise.
 */
async function checkSyntax(filePath: string): Promise<boolean> {
  try {
    const cmd = new Deno.Command('deno', {
      args: ['check', filePath],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { success, stdout, stderr } = await cmd.output();

    if (!success) {
      const errorOutput = new TextDecoder().decode(stderr);
      logger.error(`Syntax check failed for ${filePath}:\n${errorOutput}`);
      return false;
    }

    logger.info(`Syntax check passed for ${filePath}`);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Failed to execute syntax check for ${filePath}: ${error.message}`);
    } else {
      logger.error(`Unknown error during syntax check for ${filePath}`);
    }
    return false;
  }
}

/**
 * Validates that the JSDoc comment is properly opened and closed.
 * @param comments The JSDoc comments to validate.
 * @returns True if valid, false otherwise.
 */
function validateJSDoc(comments: string): boolean {
  const trimmed = comments.trim();
  return trimmed.startsWith('/**') && trimmed.endsWith('*/');
}

/**
 * Attempts to reformat the AI response to extract a valid JSDoc comment.
 * @param response The raw AI response.
 * @returns The reformatted JSDoc comment or null if extraction fails.
 */
function reformatJSDoc(response: string): string | null {
  // Attempt to extract content within /** ... */
  const jsDocMatch = response.match(/\/\*\*[\s\S]*?\*\//);
  if (jsDocMatch) {
    return jsDocMatch[0];
  }
  return null;
}

/**
 * Computes the SHA-256 hash of the given text.
 * @param text The text to hash.
 * @returns A promise that resolves to the hex string of the hash.
 */
async function computeHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Sanitizes the AI-generated JSDoc comment by replacing any occurrences of `@hash`
 * that might interfere with metadata.
 * 
 * @param {string} comment - The AI-generated JSDoc comment.
 * @returns {string} - The sanitized JSDoc comment.
 */
function sanitizeJSDoc(comment: string): string {
  // Replace any internal `@hash` occurrences to avoid confusion with our metadata `@hash`
  return comment.replace(/@hash/g, '@hash_placeholder');
}

/**
 * Generates JSDoc comments for a TypeScript file and updates the file.
 *
 * @param {string} filePath - The absolute path to the TypeScript file.
 */
export async function generateDocumentationForFile(filePath: string): Promise<void> {
  const requestId = `doc-gen-${Date.now()}`; // Unique request ID for logging

  logger.info(`Processing file: ${filePath}`, { requestId });

  try {
    // Read the content of the TypeScript file
    const originalContent = await Deno.readTextFile(filePath);

    // Extract existing header comments
    const headerMatch = originalContent.match(HEADER_COMMENT_REGEX);
    const existingHeader = headerMatch ? headerMatch[0] : '';

    // Remove existing header comments to get clean code for documentation generation
    const contentWithoutHeader = originalContent.slice(existingHeader.length);

    // Extract stored hash from existing header
    const hashMatch = existingHeader.match(HASH_REGEX);
    const storedHash = hashMatch ? hashMatch[1] : null;

    // Compute hash of the content without header
    const computedHash = await computeHash(contentWithoutHeader);

    // Compare stored hash and computed hash
    if (storedHash === computedHash) {
      logger.info(`File ${filePath} has not changed. Skipping documentation update.`, { requestId });
      return;
    }

    // Create a prompt to generate JSDoc comments using the clean content
    const prompt = `
You are an expert TypeScript developer. I will provide you with TypeScript code, and I want you to generate a single clear and concise JSDoc comment block to be inserted at the top of the file for the exported functions.

- The JSDoc comment should start with /** and end with */.
- Use proper JSDoc syntax.
- Any import paths from the src directory should use "@/". (e.g., '@/utils/audio/podcast.ts').
- The comment should explain how to use any exported functions.

Please return only the JSDoc comment.

TypeScript code:
\`\`\`typescript
${contentWithoutHeader}
\`\`\`
`;

    // Call the OpenAI API to generate documentation
    const aiResponse = await callOpenAI({ prompt, requestId });

    // Log the raw AI response for debugging
    logger.debug(`Raw AI response for ${filePath}:\n${aiResponse}`, { requestId });

    // Extract the JSDoc comments from the AI response
    let documentedComments = extractJSDocComment(aiResponse as string);

    if (!documentedComments || !validateJSDoc(documentedComments)) {
      logger.warning(`Initial extraction failed or invalid JSDoc. Attempting to reformat AI response.`, { requestId });

      // Attempt to reformat the response
      documentedComments = reformatJSDoc(aiResponse as string);

      if (!documentedComments || !validateJSDoc(documentedComments)) {
        logger.error(`Failed to extract valid JSDoc comments from OpenAI response for file ${filePath}.`, { requestId });
        logger.error(`Extracted Comments:\n${documentedComments}`, { requestId });
        throw new Error('Invalid JSDoc comments');
      } else {
        logger.info(`Successfully reformatted JSDoc comments for file ${filePath}.`, { requestId });
      }
    } else {
      logger.info(`Successfully extracted JSDoc comments for file ${filePath}.`, { requestId });
    }

    // Before processing the comment, sanitize it to avoid any accidental @hash conflicts
    documentedComments = sanitizeJSDoc(documentedComments);

    // Insert or replace the @hash tag within the JSDoc comment
    if (HASH_REGEX.test(documentedComments)) {
      // Replace existing @hash
      documentedComments = documentedComments.replace(HASH_REGEX, `@hash ${computedHash}`);
    } else {
      // Insert new @hash before the closing */
      documentedComments = documentedComments.replace(
        /\*\/\s*$/,
        `\n *\n * @hash ${computedHash}\n */`
      );
    }

    // Combine the new documentation with the content without the old header
    const newContent = `${documentedComments}\n\n${contentWithoutHeader}`;

    // Write the updated content back to the original file
    await Deno.writeTextFile(filePath, newContent);
    logger.info(`Documentation updated for: ${filePath}`, { requestId });

    // Perform a syntax check using Deno
    const isSyntaxValid = await checkSyntax(filePath);

    if (!isSyntaxValid) {
      logger.error(`Syntax check failed after updating documentation for file ${filePath}.`, { requestId });
      throw new Error('Syntax check failed');
    }

    logger.info(`Documentation and syntax check successful for: ${filePath}`, { requestId });
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error processing file ${filePath}: ${error.message}`, { requestId });
    } else {
      logger.error(`Unknown error processing file ${filePath}`, { requestId });
    }
    throw error; // Re-throw to be caught in the main function
  }
}

/**
 * Main function to generate user documentation for TypeScript files.
 * Supports development mode to process a single file.
 */
export async function main() {
  const requestId = `doc-gen-main-${Date.now()}`; // Unique request ID for logging

  try {
    // Get the list of relevant TypeScript files
    const tsFiles = await listTsFiles();

    if (tsFiles.length === 0) {
      logger.info('No TypeScript files to process.', { requestId });
      return;
    }

    if (DEV_MODE) {
      // Development Mode: Process a single file
      let fileToProcess: string | undefined;

      if (SPECIFIC_FILE_PATH) {
        // Resolve the absolute path of the specified file
        const resolvedFile = resolvePath(SPECIFIC_FILE_PATH);
        if (tsFiles.includes(resolvedFile)) {
          fileToProcess = resolvedFile;
        } else {
          logger.error(`Specified file ${SPECIFIC_FILE_PATH} is not in the list of relevant TypeScript files.`, { requestId });
          return;
        }
      } else {
        // If no specific file is specified, process the first file in the list
        fileToProcess = tsFiles[0];
        logger.info('Development mode: Processing only the first file.', { requestId });
      }

      if (fileToProcess) {
        await generateDocumentationForFile(fileToProcess);
        logger.info('Development mode: Exiting after processing one file.', { requestId });
      }
    } else {
      // Production Mode: Process all files
      for (const filePath of tsFiles) {
        try {
          await generateDocumentationForFile(filePath);
        } catch (error: unknown) {
          if (error instanceof Error) {
            logger.error(`Failed to generate documentation for ${filePath}: ${error.message}`, { requestId });
          } else {
            logger.error(`Unknown error generating documentation for ${filePath}`, { requestId });
          }
          // Continue processing other files instead of stopping
        }
      }

      logger.info('Documentation generation completed successfully.', { requestId });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error in documentation generation: ${error.message}`, { requestId });
    } else {
      logger.error(`Unknown error in documentation generation`, { requestId });
    }
  }
}

// If the script is run directly, execute the main function
if (import.meta.main) {
  main();
}
