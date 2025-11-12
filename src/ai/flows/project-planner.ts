'use server';

/**
 * @fileoverview Defines a Genkit flow for generating a structured project plan.
 * This flow takes high-level project details and creates a phased plan with
 * specific tasks and estimated durations.
 */

import {ai} from '@/ai';
import {z} from 'zod';

// Define the schema for the input, which includes the project's name and description.
export const ProjectPlannerInputSchema = z.object({
  projectName: z.string(),
  description: z.string(),
});
export type ProjectPlannerInput = z.infer<typeof ProjectPlannerInputSchema>;

// Define the schema for a single task within a project phase.
const TaskSchema = z.object({
  taskName: z.string().describe('A clear, actionable name for the task.'),
  description: z.string().describe('A brief, one-sentence description of what the task involves.'),
  durationDays: z.number().describe('An estimated number of days to complete the task.'),
});

// Define the schema for a single phase of the project.
const PhaseSchema = z.object({
  phaseName: z.string().describe('The name of the project phase (e.g., "Discovery & Planning", "Development").'),
  tasks: z.array(TaskSchema).describe('A list of tasks within this phase.'),
});

// Define the schema for the final output, which is the complete, phased project plan.
export const ProjectPlannerOutputSchema = z.object({
  phases: z.array(PhaseSchema).describe('An array of project phases, each containing a list of tasks.'),
});
export type ProjectPlannerOutput = z.infer<typeof ProjectPlannerOutputSchema>;


/**
 * An exported async function that wraps the Genkit flow.
 * This is the entry point for generating a project plan.
 * @param input The project name and description.
 * @returns A promise that resolves to the structured project plan.
 */
export async function generateProjectPlan(
  input: ProjectPlannerInput
): Promise<ProjectPlannerOutput> {
  return projectPlannerFlow(input);
}


// Define the Genkit prompt for the AI model.
const prompt = ai.definePrompt(
  {
    name: 'projectPlannerPrompt',
    input: {schema: ProjectPlannerInputSchema},
    output: {schema: ProjectPlannerOutputSchema},
    prompt: `You are an expert project manager. Your task is to create a structured, phased project plan based on the provided project name and description.

Break the project down into logical phases (e.g., Discovery, Design, Development, Testing, Deployment).
For each phase, define a list of clear, actionable tasks.
For each task, provide a brief description and an estimated duration in days.

The output must be a structured JSON object.

Project Name: {{projectName}}
Project Description: {{description}}
`,
  }
);

// Define the Genkit flow that orchestrates the plan generation.
const projectPlannerFlow = ai.defineFlow(
  {
    name: 'projectPlannerFlow',
    inputSchema: ProjectPlannerInputSchema,
    outputSchema: ProjectPlannerOutputSchema,
  },
  async input => {
    // Call the prompt with the input and wait for the response.
    const {output} = await prompt(input);
    
    // Return the structured output from the AI model.
    return output!;
  }
);
