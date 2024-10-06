// src/scripts/summarizeAll.ts

/**
 * summarizeAll.ts
 *
 * This script summarizes all relevant files in the project by:
 * 1. Scanning the directory for .ts, .js, .json, and .md files.
 * 2. Counting tokens in each file using tokenCount.ts.
 * 3. Allocating summary tokens proportionally based on token counts and config.openAI.max_completion_tokens.
 * 4. Generating individual summaries, handling large documents by chunking.
 * 5. Combining summaries into an overall summary using a tree-like merging strategy.
 *
 * Usage:
 *   deno run --allow-read --allow-write --allow-env src/scripts/summarizeAll.ts
 */

import { buildDirectoryStructure } from '@/scripts/blocks/tokenCount.ts';
import { writeMarkdown } from '@/utils/markdown/fileIO.ts';
import { callOpenAI } from '@/utils/llm/llm.ts';
import { config } from '@/config.ts';
import { countTokens } from '@/utils/llm/tokenizer.ts';
import logger from '@/utils/logger.ts';

const SUMMARY_FILE_NAME = 'overall_summary.md'

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
        const summary = await callOpenAI({ 
            prompt, 
            requestId: `summary_${filePath}`, 
            configOverrides: { max_completion_tokens } 
        });
        console.log(`Generated summary for ${filePath}.`);
        logger.debug(`Generated summary ${summary}for ${filePath}.`, { requestId: `summary_${filePath}` });
        return summary.trim();
    } catch (error) {
        console.error(`Error generating summary for ${filePath}:`, error);
        return '';
    }
}

/**
 * Splits the content into chunks that do not exceed the specified token limit.
 * @param content - The text content to split.
 * @param maxTokens - The maximum number of tokens per chunk.
 * @returns An array of content chunks.
 */
function splitIntoChunks(content: string, maxTokens: number): string[] {
    const paragraphs = content.split(/\n\s*\n/); // Split by paragraphs
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
        const paragraphTokens = countTokens(paragraph);
        if (countTokens(currentChunk) + paragraphTokens > maxTokens) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            if (paragraphTokens > maxTokens) {
                // Further split the paragraph if it's too long
                const sentences = paragraph.split(/(?<=[.?!])\s+/);
                for (const sentence of sentences) {
                    if (countTokens(sentence) > maxTokens) {
                        // As a last resort, split by words
                        const words = sentence.split(/\s+/);
                        let wordChunk = '';
                        for (const word of words) {
                            if (countTokens(wordChunk + ' ' + word) > maxTokens) {
                                if (wordChunk) {
                                    chunks.push(wordChunk.trim());
                                    wordChunk = '';
                                }
                            }
                            wordChunk += ` ${word}`;
                        }
                        if (wordChunk) {
                            chunks.push(wordChunk.trim());
                        }
                    } else {
                        if (countTokens(currentChunk) + countTokens(sentence) > maxTokens) {
                            if (currentChunk) {
                                chunks.push(currentChunk.trim());
                                currentChunk = '';
                            }
                        }
                        currentChunk += ` ${sentence}`;
                    }
                }
            } else {
                currentChunk += ` ${paragraph}`;
            }
        } else {
            currentChunk += ` ${paragraph}`;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

/**
 * Recursively summarizes content until it fits within the token limit.
 * @param content - The text content to summarize.
 * @param maxTokens - The maximum number of tokens for a chunk.
 * @param filePath - The path of the file being summarized (for logging purposes).
 * @returns A promise that resolves to the summary string.
 */
async function recursiveSummarize(content: string, maxTokens: number, summaryTokens: number, filePath: string): Promise<string> {
    const tokenCount = countTokens(content);
    if (tokenCount <= maxTokens) {
        return generateSummary(content, summaryTokens, filePath);
    }

    // Split content into manageable chunks
    const chunks = splitIntoChunks(content, Math.floor(maxTokens * 0.8)); // Use 80% of maxTokens for chunks
    console.log(`Content (${tokenCount}) exceeds max tokens (${maxTokens}). Splitting into ${chunks.length} chunks.`);

    // Summarize each chunk
    const chunkSummaries = await Promise.all(
        chunks.map((chunk, index) => generateSummary(chunk, summaryTokens, `${filePath}_chunk_${index + 1}`))
    );

    // Combine chunk summaries
    const combinedSummary = chunkSummaries.join('\n');

    // Recursively summarize the combined summaries
    return recursiveSummarize(combinedSummary, maxTokens, summaryTokens, `${filePath}_combined`);
}

/**
 * Main function to orchestrate the summarization process.
 */
async function summarizeAllFiles() {
    const rootDir = config.markdownDir;
    const directoryStructure = await buildDirectoryStructure(rootDir);

    if (!directoryStructure.children) {
        console.log('No relevant files found for summarization.');
        return;
    }

    // Sort the files to ensure consistent order
    const sortedFiles = directoryStructure.children
        .filter(file => file.type === 'file' && file.tokenCount)
        .sort((a, b) => a.path.localeCompare(b.path));

    const totalTokens = sortedFiles.reduce((acc, file) => acc + (file.tokenCount || 0), 0);
    console.log(`Total tokens across all files: ${totalTokens}`);

    // Retrieve max tokens from config
    const maxCompletionTokens = config.openAI.max_completion_tokens;
    const maxInputTokens = config.openAI.maxInputTokens;
    console.log(`Maximum tokens allowed: ${maxInputTokens}`);

    const availableTokensForSummaries = maxCompletionTokens;

    const summaries = {} as Record<string, string>;

    // Allocate tokens for each file's summary proportionally
    for (const file of sortedFiles) {
        if (file.name === SUMMARY_FILE_NAME) continue;
        if (file.tokenCount) {
            const allocatedTokens = Math.floor(availableTokensForSummaries * (file.tokenCount / totalTokens));
            // Ensure a minimum allocation (optional)
            const finalAllocation = allocatedTokens > 50 ? allocatedTokens : 50; // Minimum 50 tokens
            console.log(`Allocating ${finalAllocation} tokens for summary of ${file.name}`);
            const content = await Deno.readTextFile(file.path);
            const summary = await recursiveSummarize(content, maxInputTokens, finalAllocation, file.name);
            summaries[file.path] = summary;
        }
    }

    // Combine all individual summaries in the sorted order
    const combinedSummaries = sortedFiles.map(file => {
        return `**Summary of ${file.path}:**\n${summaries[file.path]}`;
    }).join('\n\n');

    // Generate the overall summary using a tree-like merging strategy
    const overallSummary = await recursiveSummarize(combinedSummaries, maxInputTokens, maxCompletionTokens, 'overall_summary');

    console.log('Overall Summary:\n', overallSummary.trim());

    // Write the overall summary to a file
    await writeMarkdown(SUMMARY_FILE_NAME, overallSummary.trim());
    console.log('Overall summary written to overall_summary.md');
}

// Execute the summarization process
summarizeAllFiles().catch(error => {
    console.error('Unexpected error during summarization:', error);
});
