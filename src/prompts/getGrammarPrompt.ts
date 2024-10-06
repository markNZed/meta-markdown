/**
 * Generates a grammar prompt for reviewing Markdown content.
 *
 * @param {string} content - The Markdown content to be reviewed for grammatical errors.
 * @returns {string} A formatted prompt requesting a grammatical review of the provided content.
 *
 * @example
 * const prompt = getGrammarPrompt("This is an example of Markdown content.");
 * console.log(prompt); 
 * // Output: Please review the following Markdown content for grammatical errors and provide a corrected version:
 * // 
 * // This is an example of Markdown content.
 */

export const getGrammarPrompt = (content: string) => {
  return `Please review the following Markdown content for grammatical errors and provide a corrected version:\n\n${content}`;
};
