/**
 * @module getGrammarPrompt
 * 
 * This module provides a utility function to generate a prompt for grammar checking.
 * 
 * @function
 * @name getGrammarPrompt
 * @param {string} content - The Markdown content that needs to be reviewed for grammatical errors.
 * @returns {string} A formatted string prompting for a grammar review of the provided content.
 * 
 * @example
 * const prompt = getGrammarPrompt("# Example\nThis is a sample content.");
 * console.log(prompt);
 * // Output: "Please review the following Markdown content for grammatical errors and provide a corrected version:\n\n# Example\nThis is a sample content."
 */

export const getGrammarPrompt = (content) => {
  return `Please review the following Markdown content for grammatical errors and provide a corrected version:\n\n${content}`;
};
