/**
 * Generates a prompt for summarizing Markdown content.
 *
 * @function
 * @param {string} content - The Markdown content that needs to be summarized.
 * @returns {string} A prompt asking for a concise summary of the provided content.
 */

export const getSummaryPrompt = (content) => {
  return `Please provide a concise summary of the following Markdown content:\n\n${content}`;
};
