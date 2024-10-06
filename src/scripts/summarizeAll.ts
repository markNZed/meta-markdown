// src/scripts/summarizeAll.ts

/**
 * summarizeAll.ts
 *
 * This script summarizes all relevant files in the project by:
 * 1. Scanning the directory for .ts, .js, .json, and .md files.
 * 2. Counting tokens in each file using tokenCount.ts.
 * 3. Allocating summary tokens proportionally based on token counts and config.openAI.max_completion_tokens.
 * 4. Generating individual summaries.
 * 5. Combining summaries into an overall summary.
 *
 * Usage:
 *   deno run --allow-read --allow-write --allow-env src/scripts/summarizeAll.ts
 */

import { buildDirectoryStructure, DirectoryStructure } from '@/scripts/blocks/tokenCount.ts';
import { writeMarkdown } from '@/utils/markdown/fileIO.ts';
import { callOpenAI } from '@/utils/llm/llm.ts';
import { config } from '@/config.ts';

/**
 * Generates a summary for the given content using OpenAI's API.
 * @param content - The text content to summarize.
 * @param max_completion_tokens - The maximum number of tokens for the summary.
 * @param filePath - The path of the file being summarized (for logging purposes).
 * @returns A promise that resolves to the summary string.
 */
async function generateSummary(content: string, max_completion_tokens: number, filePath: string): Promise<string> {
    const prompt = `Please provide a concise summary of the following content, using no more than ${max_completion_tokens} tokens:\n\n${content}`;
    try {
        const summary = await callOpenAI({ prompt, requestId: `summary_${filePath}`, configOverrides: { max_completion_tokens } });
        console.log(`Generated summary for ${filePath}.`);
        return summary.trim();
    } catch (error) {
        console.error(`Error generating summary for ${filePath}:`, error);
        return '';
    }
}

/**
 * Main function to orchestrate the summarization process.
 */
async function summarizeAllFiles() {
    const rootDir =  config.markdownDir;
    const files = await buildDirectoryStructure(rootDir);

    if (!files.children) {
        console.log('No relevant files found for summarization.');
        return;
    }

    const totalTokens = files.children.reduce((acc, file) => acc + (file.tokenCount || 0), 0);
    console.log(`Total tokens across all files: ${totalTokens}`);

    // Retrieve max tokens from config
    const max_completion_tokens = config.openAI.max_completion_tokens;
    console.log(`Maximum tokens allowed: ${max_completion_tokens}`);

    // Define token allocations
    const bufferTokens = 500; // Reserve tokens for the overall summary
    const availableTokensForSummaries = max_completion_tokens - bufferTokens;

    if (availableTokensForSummaries <= 0) {
        console.error('Configured max_completion_tokens is too low to allocate tokens for summaries and overall summary.');
        return;
    }

    const summaries = {} as Record<string, string>;

    // Allocate tokens for each file's summary proportionally
    for (const file of files.children) {
        if (file.type === 'file' && file.tokenCount) {
            const allocatedTokens = Math.floor(availableTokensForSummaries * (file.tokenCount / totalTokens));
            // Ensure a minimum allocation (optional)
            const finalAllocation = allocatedTokens > 50 ? allocatedTokens : 50; // Minimum 50 tokens
            console.log(`Allocating ${finalAllocation} tokens for summary of ${file.name}`);
            const content = await Deno.readTextFile(file.path);
            summaries[file.path] = await generateSummary(content, finalAllocation, file.name);
        }
    }

    // Combine all individual summaries
    const combinedSummaries = files.children.map(file => {
        return `**Summary of ${file.path}:**\n${summaries[file.path]}`;
    }).join('\n\n');

    // Generate the overall summary
    const finalPrompt = `Please provide an overall summary of the following summaries, ensuring the total token count does not exceed ${bufferTokens} tokens:\n\n${combinedSummaries}`;
    console.log('Generating overall summary...');

    try {
        const overallSummary = await callOpenAI({ 
            prompt: finalPrompt, 
            requestId: 'overall_summary', 
            configOverrides: { max_completion_tokens: bufferTokens } 
        });
        console.log('Overall Summary:\n', overallSummary.trim());

        // Write the overall summary to a file
        await writeMarkdown('overall_summary.md', overallSummary.trim());
        console.log('Overall summary written to overall_summary.md');
    } catch (error) {
        console.error('Error generating overall summary:', error);
    }
}

// Execute the summarization process
summarizeAllFiles().catch(error => {
    console.error('Unexpected error during summarization:', error);
});
