'use server';

/**
 * @fileOverview AI chat section where the AI has knowledge of the entire platform and current projects.
 *
 * - platformAwareAIChat - A function that handles the AI chat with platform awareness.
 * - PlatformAwareAIChatInput - The input type for the platformAwareAIChat function.
 * - PlatformAwareAIChatOutput - The return type for the platformAwareAIChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getLeadsTool, getTasksTool, getUsersTool } from '../tools/firestore';

const PlatformAwareAIChatInputSchema = z.object({
  query: z.string().describe('The user query for the AI chat.'),
  userId: z.string().describe('The ID of the user making the request.'),
});
export type PlatformAwareAIChatInput = z.infer<typeof PlatformAwareAIChatInputSchema>;

const PlatformAwareAIChatOutputSchema = z.object({
  response: z.string().describe('The AI response to the user query.'),
});
export type PlatformAwareAIChatOutput = z.infer<typeof PlatformAwareAIChatOutputSchema>;

export async function platformAwareAIChat(input: PlatformAwareAIChatInput): Promise<PlatformAwareAIChatOutput> {
  return platformAwareAIChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'platformAwareAIChatPrompt',
  input: {schema: PlatformAwareAIChatInputSchema},
  output: {schema: PlatformAwareAIChatOutputSchema},
  tools: [getLeadsTool, getTasksTool, getUsersTool],
  prompt: `You are Sasha AI, an expert assistant with real-time knowledge of this CRM platform.
  Your current user's ID is {{userId}}.
  Use the available tools to access live data about leads, tasks (also called tickets), and users to answer questions.
  Be helpful and provide detailed, actionable information. If you use a tool, summarize the results in a clear and readable way.

  Examples:
  - "Show me all new leads"
  - "What tasks are assigned to Jane Doe?"
  - "Summarize the ticket about the Innovate Inc. follow-up"
  - "List all registered users"

  Current Date: ${new Date().toLocaleDateString()}
  Query: {{{query}}}`,
});

const platformAwareAIChatFlow = ai.defineFlow(
  {
    name: 'platformAwareAIChatFlow',
    inputSchema: PlatformAwareAIChatInputSchema,
    outputSchema: PlatformAwareAIChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
