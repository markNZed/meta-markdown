// src/scripts/generateDocumentation.ts

import { listTsFiles } from './blocks/listTsFiles.ts'; // Import the function to list TypeScript files
import { callOpenAI } from '@/utils/llm/llm.ts'; // Your existing OpenAI utility
import logger from '@/utils/logger.ts'; // Your existing logger utility
import { resolvePath } from '@/utils/file.ts';
import { extractTypeScriptCode } from '@/utils/llm/llm.ts';

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
 * Executes a Deno syntax check on the specified file.
 * @param filePath The path to the TypeScript file to check.
 * @returns A promise that resolves to true if syntax is valid, false otherwise.
 */
async function checkSyntax(filePath: string): Promise<boolean> {
  try {
    const cmd = new Deno.Command("deno", {
      args: ["check", filePath],
      stdout: "piped",
      stderr: "piped",
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
 * Validates that the JSDoc comment is properly closed.
 * @param comments The JSDoc comments to validate.
 * @returns True if valid, false otherwise.
 */
function validateJSDoc(comments: string): boolean {
  console.log("comments", comments)
  return comments.trim().endsWith('*/');
}

/**
 * Generates JSDoc comments for a TypeScript file and updates the file.
 * 
 * @param {string} filePath - The absolute path to the TypeScript file.
 */
export async function generateDocumentationForFile(filePath: string): Promise<void> {
  const requestId = `doc-gen-${Date.now()}`; // Unique request ID for logging

  try {
    logger.info(`Processing file: ${filePath}`, { requestId });

    // Read the content of the TypeScript file
    const originalContent = await Deno.readTextFile(filePath);

    // Remove existing header comments to get clean code for documentation generation
    const contentWithoutHeader = originalContent.replace(HEADER_COMMENT_REGEX, '');

    // Create a prompt to generate JSDoc comments using the clean content
    const prompt = `
You are an expert TypeScript developer. I will provide you with TypeScript code, and I want you to generate clear and concise JSDoc comments to be inserted at the top of the file for the use of the exported functions. 

Any examples of importing files from the src directory should use "@/" e.g.
import { convertToPodcast } from '@/utils/audio/podcast.ts';

Please return only the comments enclosed within a markdown code block, and ensure that all comment blocks are properly closed.

TypeScript code:
\`\`\`typescript
${contentWithoutHeader}
\`\`\`
`;

    // Call the OpenAI API to generate documentation
    const aiResponse = await callOpenAI(prompt, requestId);

    console.log("contentWithoutHeader", contentWithoutHeader)

    // Extract the JSDoc comments from the AI response
    const documentedComments = extractTypeScriptCode(aiResponse as string);

    if (!documentedComments) {
      logger.error(`Failed to extract JSDoc comments from OpenAI response for file ${filePath}.`, { requestId });
      return;
    }

    // Validate the extracted comments
    if (!validateJSDoc(documentedComments)) {
      logger.error(`Extracted JSDoc comments are improperly formatted for file ${filePath}.`, { requestId });
      logger.error(`Extracted Comments:\n${documentedComments}`, { requestId });
      return;
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
      return;
    }

    logger.info(`Documentation and syntax check successful for: ${filePath}`, { requestId });

  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error processing file ${filePath}: ${error.message}`, { requestId });
    } else {
      logger.error(`Unknown error processing file ${filePath}`, { requestId });
    }
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
        await generateDocumentationForFile(filePath);
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
