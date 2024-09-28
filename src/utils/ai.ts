// Import the OpenAI configuration
import { openAI } from '../config/ai-config.ts';

/**
 * Calls the OpenAI API with the provided prompt and returns the assistant's reply.
 *
 * @param {string} prompt - The user's input prompt.
 * @returns {Promise<string>} - The assistant's reply from OpenAI.
 * @throws Will throw an error if the API call fails or the response is invalid.
 */
export const callOpenAI = async (prompt: string): Promise<string> => {
  const url = 'https://api.openai.com/v1/chat/completions';
  
  // Define the headers, including the authorization token
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${openAI.apiKey}`,
  };
  
  // Define the request body with the necessary parameters
  const body = {
    model: openAI.model,
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ],
    max_tokens: openAI.maxTokens,
    temperature: openAI.temperature,
  };
  
  try {
    // Make the POST request to the OpenAI API
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    // Check if the response status is not OK (i.e., not in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Extract the assistant's reply from the response
    const reply = data.choices?.[0]?.message?.content?.trim();
    
    // Ensure that a reply was received
    if (!reply) {
      throw new Error('No reply received from OpenAI API');
    }
    
    return reply;
  } catch (error) {
    // Handle and rethrow errors with a clear message
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    } else {
      throw new Error('An unknown error occurred while calling OpenAI API');
    }
  }
};
