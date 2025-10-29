'use server';

/**
 * @fileOverview AI-powered project timeline generator.
 *
 * - generateProjectTimeline - A function that generates a project timeline.
 * - GenerateProjectTimelineInput - The input type for the generateProjectTimeline function.
 * - GenerateProjectTimelineOutput - The return type for the generateProjectTimeline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectTimelineInputSchema = z.object({
  projectScope: z
    .string()
    .describe('The scope of the project, including its goals and deliverables.'),
  projectComplexity: z
    .string()
    .describe('The complexity of the project, considering factors such as technical difficulty, team size, and dependencies.'),
});
export type GenerateProjectTimelineInput = z.infer<
  typeof GenerateProjectTimelineInputSchema
>;

const GenerateProjectTimelineOutputSchema = z.object({
  timeline: z.string().describe('The generated project timeline.'),
});
export type GenerateProjectTimelineOutput = z.infer<
  typeof GenerateProjectTimelineOutputSchema
>;

export async function generateProjectTimeline(
  input: GenerateProjectTimelineInput
): Promise<GenerateProjectTimelineOutput> {
  return generateProjectTimelineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectTimelinePrompt',
  input: {schema: GenerateProjectTimelineInputSchema},
  output: {schema: GenerateProjectTimelineOutputSchema},
  prompt: `You are Sasha, an AI assistant specializing in project management.

  Based on the project scope and complexity provided, generate a project timeline.

  Project Scope: {{{projectScope}}}
  Project Complexity: {{{projectComplexity}}}

  Consider the following factors when creating the timeline:
  - Project goals and deliverables
  - Technical difficulty
  - Team size
  - Dependencies

  Return the timeline in a readable format.
  `,
});

const generateProjectTimelineFlow = ai.defineFlow(
  {
    name: 'generateProjectTimelineFlow',
    inputSchema: GenerateProjectTimelineInputSchema,
    outputSchema: GenerateProjectTimelineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
