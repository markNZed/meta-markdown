// src/scripts/generateDocumentation.ts

import { listTsFiles } from './blocks/listTsFiles.ts'; // Import the function to list TypeScript files
import { callOpenAI } from '@/utils/llm/llm.ts'; // Your existing OpenAI utility
import logger from '@/utils/logger.ts'; // Your existing logger utility
import { resolvePath } from '@/utils/file.ts';
import { extractTypeScriptCode } from '@/utils/llm/llm.ts';

// Toggle Development Mode: Set to true during development to process a single file
const DEV_MODE = true;

// Optional: Specify a particular file to process in development mode
const SPECIFIC_FILE_PATH = './src/utils/logger.ts'; // Adjust this path as needed

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
    const content = await Deno.readTextFile(filePath);

    // Create a prompt to generate JSDoc comments
    const prompt = `
You are an expert TypeScript developer. I will provide you with TypeScript code, and I want you to generate clear and concise JSDoc comments for each function, class, or interface. Include descriptions for parameters, return types, and usage examples where appropriate.

Please return only the TypeScript code with added JSDoc comments, enclosed within a markdown code block.

TypeScript code:
\`\`\`typescript
${content}
\`\`\`
`;

    // Call the OpenAI API to generate documentation
    const aiResponse = await callOpenAI(prompt, requestId);

    // Extract the TypeScript code from the AI response
    const documentedContent = extractTypeScriptCode(aiResponse);

    if (!documentedContent) {
      logger.error(`Failed to extract TypeScript code from OpenAI response for file ${filePath}.`, { requestId });
      return;
    }

    // Update the file with the generated documentation
    await Deno.writeTextFile(filePath, documentedContent);
    logger.info(`Documentation added to: ${filePath}`, { requestId });
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
