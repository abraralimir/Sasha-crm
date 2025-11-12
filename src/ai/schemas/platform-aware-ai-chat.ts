import {z} from 'zod';

// Define the schema for the flow's input.
export const PlatformChatInputSchema = z.object({
  prompt: z.string().describe('The question asked by the user.'),
  context: z
    .string()
    .describe(
      'A stringified JSON object containing relevant data from the CRM (leads, tasks, users, etc.) to provide context for the answer.'
    ),
});
export type PlatformChatInput = z.infer<typeof PlatformChatInputSchema>;

// Define the schema for the flow's output.
export const PlatformChatOutputSchema = z.object({
  answer: z.string().describe('A helpful and contextually accurate answer to the user\'s question.'),
});
export type PlatformChatOutput = z.infer<typeof PlatformChatOutputSchema>;
