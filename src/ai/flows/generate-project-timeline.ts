'use server';

/**
 * @fileOverview AI-powered project timeline and plan generator.
 *
 * - generateProjectTimeline - A function that generates a structured project plan.
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
    .describe('The complexity of the project, considering factors such as technical difficulty, team size, and dependencies. e.g., "Low", "Medium", "High"'),
});
export type GenerateProjectTimelineInput = z.infer<
  typeof GenerateProjectTimelineInputSchema
>;

const GenerateProjectTimelineOutputSchema = z.object({
  timeline: z.string().describe(`A structured project plan in JSON format. The JSON should be a single object with a 'phases' key, which is an array of phase objects. Each phase object should have 'phaseName' (string) and 'tasks' (an array of task objects). Each task object should have 'taskName' (string), 'description' (string), and 'durationDays' (number). Example: {"phases": [{"phaseName": "Discovery", "tasks": [{"taskName": "Initial Meeting", "description": "Discuss project goals.", "durationDays": 1}]}]}`),
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
  prompt: `You are Sasha, an AI assistant specializing in project management. Your task is to generate a structured, logical project plan based on the provided scope and complexity.

  Project Scope: {{{projectScope}}}
  Project Complexity: {{{projectComplexity}}}

  Your output MUST be a valid JSON object containing a single key "phases".
  The "phases" key should be an array of objects, where each object represents a logical project phase (e.g., "Phase 1: Discovery & Planning", "Phase 2: Design & Prototyping").
  
  Each phase object must have two keys:
  1. "phaseName": A string for the name of the phase.
  2. "tasks": An array of task objects for that phase.

  Each task object must have three keys:
  1. "taskName": A string for the specific, actionable task.
  2. "description": A brief string describing the task's purpose.
  3. "durationDays": A number representing a realistic estimated duration in days.

  Do not include any text, markdown, or formatting outside of the main JSON object. The entire output must be parseable as JSON.
  `,
  config: {
    temperature: 0.4,
  }
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
