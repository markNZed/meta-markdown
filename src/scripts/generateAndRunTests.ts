// src/scripts/generateAndRunTests.ts

import { listTsFiles } from './blocks/listTsFiles.ts';
import { callOpenAI } from '@/utils/llm/llm.ts';
import logger from '@/utils/logger.ts';
import { resolvePath, ensureDir } from '@/utils/file.ts';
import { extractTypeScriptCode } from '@/utils/llm/llm.ts';
import { dirname, join, relative, basename, extname } from 'https://deno.land/std@0.203.0/path/mod.ts';
import { zodResponseFormat } from "npm:openai/helpers/zod";
import { z } from "npm:zod";
import { getGenerateTest } from "@/prompts/getGenerateTest.js";

const DEV_MODE = true;
const SPECIFIC_FILE_PATH = './src/utils/file.ts'; // Adjust this path as needed
const TEST_DIR = './tests'; // Adjust this path as needed

export async function generateTestForFile(filePath: string): Promise<string | null> {
  const requestId = `test-gen-${Date.now()}`;
  
  try {
    logger.info(`Processing file: ${filePath}`, { requestId });

    const relativePath = relative('src', filePath);
    const testFileName = `${basename(filePath, extname(filePath))}.test.ts`;
    const testFilePath = join(TEST_DIR, dirname(relativePath), testFileName);

    // Skip if test file already exists
    try {
      await Deno.stat(testFilePath);
      logger.info(`Test file already exists, skipping: ${testFilePath}`, { requestId });
      return testFilePath;
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        logger.info(`No existing test file found, proceeding to generate: ${testFilePath}`, { requestId });
      } else {
        throw err;
      }
    }

    const content = await Deno.readTextFile(filePath);

    const prompt = getGenerateTest(content);

    const aiResponse = await callOpenAI(prompt, requestId) as string;
    const testContent = extractTypeScriptCode(aiResponse);

    if (!testContent) {
      logger.error(`Failed to extract TypeScript code from OpenAI response for file ${filePath}.`, { requestId });
      return null;
    }

    // Ensure the directory for testFilePath exists
    const testDir = dirname(testFilePath);
    await ensureDir(testDir);
    
    await Deno.writeTextFile(testFilePath, testContent);
    logger.info(`Test file created: ${testFilePath}`, { requestId });
    
    return testFilePath;
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error processing file ${filePath}: ${error.message}`, { requestId });
    } else {
      logger.error(`Unknown error processing file ${filePath}`, { requestId });
    }
    return null;
  }
}

// Function to run a test file and return the result
export async function runTest(testFilePath: string): Promise<{ success: boolean; errorMessage?: string }> {
  try {

    const p = await new Deno.Command("deno", {
      args: ["test", testFilePath],
      stdout: "piped",
      stderr: "piped",
    }).output();

    const td = new TextDecoder();
    const stdout = td.decode(p.stdout).trim();
    const stderr = td.decode(p.stderr).trim();

    // No explicit close is required as the new Deno.Command handles resource cleanup.

    if (p.success) {
      return { success: true };
    } else {
      return { success: false, errorMessage: stderr || stdout };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, errorMessage: error.message };
    } else {
      return { success: false, errorMessage: "Unknown error occurred while running the test." };
    }
  }
}

export async function regenerateAndRunTest(testFilePath: string, attempt: number): Promise<boolean> {
  const requestId = `test-retry-${Date.now()}`;
  try {
    // Define a Zod schema for the expected response
    const LLMCheckResponseSchema = z.object({
      completeness: z.enum(["yes", "no"]),
      problems: z.array(z.string()),
    });

    // Create response_format using zodResponseFormat
    const responseFormat = zodResponseFormat(LLMCheckResponseSchema, "completeness");

    const llmCheckPrompt = `
    You are an expert TypeScript developer. Please analyze the following unit test code and determine if it is complete and executable as it stands. If any information is missing, such as additional mock data, imports, or missing function definitions. Indicate if the test is OK by setting completeness to "yes" or "no". For each problem you see in the test create an entry in the problems array.

    Unit test code:
    \`\`\`typescript
    ${await Deno.readTextFile(testFilePath)}
    \`\`\`
    `;

    const llmCheckResponse = await callOpenAI(llmCheckPrompt, requestId, responseFormat) as Record<string, string>;

    // Process the response
    if (llmCheckResponse.completeness === 'no') {
      logger.warning(`The generated test file may be incomplete. User input may be required: ${testFilePath}`, { requestId });
      llmCheckResponse.problems.forEach((problem) => {
        logger.warning(`    Problem: ${problem}`, { requestId });
      })
      return false;
    }

    const result = await runTest(testFilePath);
    if (result.success) {
      logger.info(`Test passed for ${testFilePath}`, { requestId });
      return true;
    } else {
      logger.error(`Test failed for ${testFilePath}: ${result.errorMessage}`, { requestId });
      if (attempt < 3) {
        logger.info(`Regenerating test for ${testFilePath}, attempt ${attempt + 1}`, { requestId });
        const originalContent = await Deno.readTextFile(testFilePath.replace(/\.test\.ts$/, '.ts'));

        const prompt = `
You are an expert TypeScript developer. A unit test failed for the following code. Please regenerate a different version of the unit test. The resulting code should be written in TypeScript and use Deno.test.

Original code:
\`\`\`typescript
${originalContent}
\`\`\`

Failed test:
\`\`\`typescript
${await Deno.readTextFile(testFilePath)}
\`\`\`
        `;

        const aiResponse = await callOpenAI(prompt, requestId) as string;
        const newTestContent = extractTypeScriptCode(aiResponse);

        if (!newTestContent) {
          logger.error(`Failed to extract regenerated TypeScript code for ${testFilePath}.`, { requestId });
          return false;
        }

        const newTestFilePath = testFilePath.replace(/(\.test)?\.ts$/, `_${attempt + 1}.test.ts`);
        await Deno.writeTextFile(newTestFilePath, newTestContent);
        logger.info(`Regenerated test file created: ${newTestFilePath}`, { requestId });
        return regenerateAndRunTest(newTestFilePath, attempt + 1);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error running or regenerating test ${testFilePath}: ${error.message}`, { requestId });
    } else {
      logger.error(`Unknown error in test generation or execution for ${testFilePath}`, { requestId });
    }
  }
  return false;
}

export async function processFile(filePath: string, summary: { total: number; passed: number; failed: number }, requestId: string): Promise<void> {
  summary.total++;
  const testFilePath = await generateTestForFile(filePath);
  if (testFilePath) {
    const passed = await regenerateAndRunTest(testFilePath, 1);
    if (passed) {
      summary.passed++;
    } else {
      summary.failed++;
    }
  }
}

export async function main() {
  const requestId = `test-gen-main-${Date.now()}`;
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  try {
    const tsFiles = await listTsFiles();
    if (tsFiles.length === 0) {
      logger.info('No TypeScript files to process.', { requestId });
      return;
    }

    if (DEV_MODE) {
      let fileToProcess: string | undefined;

      if (SPECIFIC_FILE_PATH) {
        const resolvedFile = resolvePath(SPECIFIC_FILE_PATH);
        if (tsFiles.includes(resolvedFile)) {
          fileToProcess = resolvedFile;
        } else {
          logger.error(`Specified file ${SPECIFIC_FILE_PATH} is not in the list of relevant TypeScript files.`, { requestId });
          return;
        }
      } else {
        fileToProcess = tsFiles[0];
        logger.info('Development mode: Processing only the first file.', { requestId });
      }

      if (fileToProcess) {
        await processFile(fileToProcess, summary, requestId);
        logger.info('Development mode: Exiting after processing one file.', { requestId });
      }
    } else {
      for (const filePath of tsFiles) {
        await processFile(filePath, summary, requestId);
      }
      logger.info('Test generation completed successfully.', { requestId });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      logger.error(`Error in test generation: ${error.message}`, { requestId });
    } else {
      logger.error(`Unknown error in test generation`, { requestId });
    }
  } finally {
    logger.info(`Summary:
  Total Tests Generated: ${summary.total}
  Passed: ${summary.passed}
  Failed: ${summary.failed}`, { requestId });
  }
}

if (import.meta.main) {
  main();
}