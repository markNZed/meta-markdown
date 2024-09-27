export const getGrammarPrompt = (content) => {
  return `Please review the following Markdown content for grammatical errors and provide a corrected version:\n\n${content}`;
};
