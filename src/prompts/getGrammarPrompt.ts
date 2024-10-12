/**
 * Generates a grammar review prompt for the provided Markdown content.
 *
 * @param {string} content - The Markdown content that needs to be reviewed for grammatical errors.
 * @returns {string} A formatted prompt string requesting a review of the provided content.
 *
 * @example
 * const prompt = getGrammarPrompt("# Hello World\nThis is a test.");
 * console.log(prompt);
 * // Output: Please review the following Markdown content for grammatical errors and provide a corrected version:
 * // 
 * // # Hello World
 * // This is a test.
 
 * @hash b6d649376d1f388c71025a5f0df15ec71d7ee695b93a004ce961402b15b137af
 */

export const getGrammarPrompt = (content: string) => {
  return `Please review the following Markdown content for grammatical errors and provide a corrected version:\n\n${content}`;
};
