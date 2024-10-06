/**
 * Generates a summary prompt for the given Markdown content.
 *
 * @param {string} content - The Markdown content to summarize.
 * @returns {string} A formatted prompt requesting a concise summary of the provided content.
 *
 * @example
 * const markdownContent = "# Title\n\nSome content here.";
 * const prompt = getSummaryPrompt(markdownContent);
 * console.log(prompt);
 * // Output: "Please provide a concise summary of the following Markdown content:\n\n# Title\n\nSome content here."
 */

export const getSummaryPrompt = (content: string) => {
  return `Please provide a concise summary of the following Markdown content:\n\n${content}`;
};
