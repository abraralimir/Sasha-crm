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
  prompt: `You are an AI assistant with knowledge of the entire platform and current projects.
  Use this knowledge to answer the user's query in a helpful and informative way.
  \n  Query: {{{query}}}`,
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
