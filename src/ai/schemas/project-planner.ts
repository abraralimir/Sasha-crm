
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
