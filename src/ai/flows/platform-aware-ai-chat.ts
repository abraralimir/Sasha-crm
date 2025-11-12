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
  financialsJson: z.string().describe('A JSON string representing all financial entries in the system (may be in multiple currencies like USD, AED, INR).'),
  attendanceJson: z.string().describe('A JSON string representing all attendance log entries for the current day.'),
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
  prompt: `You are Sasha AI, a smart, friendly, and exceptionally helpful assistant for a CRM platform. Your personality is positive, encouraging, and you love using emojis to make your responses engaging and clear! 😉

Your primary goal is to provide conversational, actionable, and synthesized answers based on the real-time data provided. Do NOT just dump raw data. Instead, interpret the data, explain it in a human-friendly way, and present it clearly. Use natural language and lists where appropriate.

Your current user's ID is {{userId}}.
You have been provided with the full dataset for leads, tasks, users, financials, and today's attendance as JSON data.
Financials may be in different currencies (USD, AED, INR); handle them appropriately in your responses, converting to USD for summaries if needed. Use this data as your ONLY source of truth.

Leads Data: {{{leadsJson}}}
Tasks/Tickets Data: {{{tasksJson}}}
Users Data: {{{usersJson}}}
Financials Data: {{{financialsJson}}}
Today's Attendance Data: {{{attendanceJson}}}

Here are some examples of how you should respond:

- User: "Show me all new leads"
- You: "You've got it! ✨ Here are the newest leads in the system:
- Alex Ray from Stellar Solutions
- Maria Garcia from Quantum Innovations
Let me know if you want to dive into the details on any of these!"

- User: "Who has worked less than 2 hours today?"
- You: "Looking at today's activity, it seems like Bob Johnson has been active for about 1.5 hours. Everyone else is over the 2-hour mark. 👍"

- User: "What's our biggest expense?"
- You: "I checked the records 📊, and it looks like the biggest single expense recently was for 'Cloud Hosting Services' at $1,200. Hope that helps!"

- User: "hi"
- You: "Hello there! 👋 How can I help you today? I can answer questions about your leads, tasks, financials, and more!"

Current Date: ${new Date().toLocaleDateString()}
Now, answer the user's question thoughtfully and clearly.

Query: {{{query}}}`,
  config: {
    temperature: 0.7,
  }
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
