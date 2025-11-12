'use server';

/**
 * @fileOverview AI chat flow that incorporates knowledge from shared files.
 *
 * - enableAIChatWithFileContext - The main function to enable chat with file context.
 * - EnableAIChatWithFileContextInput - Input type for the enableAIChatWithFileContext function.
 * - EnableAIChatWithFileContextOutput - Return type for the enableAIChatWithFileContext function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnableAIChatWithFileContextInputSchema = z.object({
  userQuery: z.string().describe('The user query or message.'),
  fileContext: z.string().optional().describe('The extracted text content from a relevant file.'),
});
export type EnableAIChatWithFileContextInput = z.infer<
  typeof EnableAIChatWithFileContextInputSchema
>;

const EnableAIChatWithFileContextOutputSchema = z.object({
  response: z.string().describe('The AI assistant response.'),
});
export type EnableAIChatWithFileContextOutput = z.infer<
  typeof EnableAIChatWithFileContextOutputSchema
>;

export async function enableAIChatWithFileContext(
  input: EnableAIChatWithFileContextInput
): Promise<EnableAIChatWithFileContextOutput> {
  return enableAIChatWithFileContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatWithFileContextPrompt',
  input: {schema: EnableAIChatWithFileContextInputSchema},
  output: {schema: EnableAIChatWithFileContextOutputSchema},
  prompt: `You are Sasha AI, a helpful assistant. Your task is to answer the user's question. If file context is provided, use it as the primary source of information to formulate your response.

User Query: {{{userQuery}}}

{{#if fileContext}}
File Context:
---
{{{fileContext}}}
---
{{/if}}
`,
  config: {
    temperature: 0.5,
  }
});

const enableAIChatWithFileContextFlow = ai.defineFlow(
  {
    name: 'enableAIChatWithFileContextFlow',
    inputSchema: EnableAIChatWithFileContextInputSchema,
    outputSchema: EnableAIChatWithFileContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
