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

const PlatformAwareAIChatInputSchema = z.object({
  query: z.string().describe('The user query for the AI chat.'),
  userId: z.string().describe('The ID of the user making the request.'),
  leadsJson: z.string().describe('A JSON string representing all the leads in the system.'),
  tasksJson: z.string().describe('A JSON string representing all the tasks/tickets in the system.'),
  usersJson: z.string().describe('A JSON string representing all the users in the system.'),
  financialsJson: z.string().describe('A JSON string representing all financial entries in the system.'),
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
  prompt: `You are Sasha AI, an expert assistant with real-time knowledge of this CRM platform.
  Your current user's ID is {{userId}}.
  You have been provided with the full dataset for leads, tasks, users, and financials as JSON data. Use this data as your primary source of truth to answer any questions.

  Leads Data: {{{leadsJson}}}
  Tasks/Tickets Data: {{{tasksJson}}}
  Users Data: {{{usersJson}}}
  Financials Data: {{{financialsJson}}}

  Be helpful and provide detailed, actionable information based on the provided data.

  Examples:
  - "Show me all new leads"
  - "What tasks are assigned to Jane Doe?"
  - "Summarize the ticket about the Innovate Inc. follow-up"
  - "List all registered users"
  - "What was our biggest expense last month?"

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
