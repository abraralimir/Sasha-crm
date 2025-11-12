
'use server';

/**
 * @fileoverview Defines the primary Genkit flow for the "Ask Sasha AI" chatbot.
 * This flow is designed to answer user questions with an awareness of the
 * current state of the application's data by accepting a context string.
 */

import {ai} from '@/ai';
import {
  PlatformChatInputSchema,
  PlatformChatOutputSchema,
  type PlatformChatInput,
  type PlatformChatOutput,
} from '@/ai/schemas/platform-aware-ai-chat';


/**
 * An exported async function that wraps the Genkit flow.
 * This is the main entry point for the AI chat feature.
 * @param input The user's prompt and the contextual data string.
 * @returns A promise that resolves to the AI's answer.
 */
export async function askSasha(
  input: PlatformChatInput
): Promise<PlatformChatOutput> {
  return platformChatFlow(input);
}


// Define the Genkit prompt for the AI model.
const prompt = ai.definePrompt(
    {
        name: 'platformChatPrompt',
        input: {schema: PlatformChatInputSchema},
        output: {schema: PlatformChatOutputSchema},
        // The system prompt that instructs the AI on its role and how to use the provided context.
        prompt: `You are Sasha, an intelligent AI assistant for the SashaLeads CRM platform. Your purpose is to provide helpful, accurate, and concise answers to user questions based on the real-time data provided.

IMPORTANT: Use ONLY the data provided in the 'Platform Context' section below to answer the user's question. Do not invent or assume any information. If the answer is not in the context, say "I do not have enough information to answer that."

Platform Context:
\`\`\`json
{{{context}}}
\`\`\`

User's Question:
"{{prompt}}"
`,
    }
);


// Define the Genkit flow that orchestrates the chat response.
const platformChatFlow = ai.defineFlow(
  {
    name: 'platformChatFlow',
    inputSchema: PlatformChatInputSchema,
    outputSchema: PlatformChatOutputSchema,
  },
  async input => {
    // Call the prompt with the input and wait for the response.
    const {output} = await prompt(input);
    
    // Return the structured output from the AI model.
    return output!;
  }
);
