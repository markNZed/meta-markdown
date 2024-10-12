/**
 * Generates a summary prompt for the given Markdown content.
 *
 * @param {string} content - The Markdown content for which to generate a summary prompt.
 * @returns {string} A formatted string that asks for a concise summary of the provided content.
 *
 * @example
 * const prompt = getSummaryPrompt('# Title\n\nThis is a sample content.');
 * // prompt will be: "Please provide a concise summary of the following Markdown content:\n\n# Title\n\nThis is a sample content."
 
 * @hash 9fb0e9b72bea9d2c49bb52495373fdacb80324e7885a04ac3e7df6bb915637dd
 */

export const getSummaryPrompt = (content: string) => {
  return `Please provide a concise summary of the following Markdown content:\n\n${content}`;
};
