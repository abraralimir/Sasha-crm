'use server';

/**
 * @fileOverview AI chat section where the AI has knowledge of the entire platform and current projects.
 *
 * - platformAwareAIChat - A function that handles the AI chat with platform awareness.
 * - PlatformAwareAIChatInput - The input type for the platformAwareAIChat function.
 * - PlatformAwareAIChatOutput - The return type for the platformAwareAIChat function.
 */

import {ai} from '@/ai/genkit';
import { getExchangeRates } from '@/lib/currency';
import type { FinancialEntry } from '@/lib/types';
import {z} from 'genkit';

const PlatformAwareAIChatInputSchema = z.object({
  query: z.string().describe('The user query for the AI chat.'),
  userId: z.string().describe('The ID of the user making the request.'),
  leadsJson: z.string().describe('A JSON string representing all the leads in the system.'),
  tasksJson: z.string().describe('A JSON string representing all the tasks/tickets in the system.'),
  usersJson: z.string().describe('A JSON string representing all the users in the system.'),
  financialsJson: z.string().describe('A JSON string representing all financial entries in the system.'),
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
  input: {schema: z.object({
    userId: z.string(),
    leadsJson: z.string(),
    tasksJson: z.string(),
    usersJson: z.string(),
    financialsJson: z.string(),
    attendanceJson: z.string(),
    query: z.string(),
  })},
  output: {schema: PlatformAwareAIChatOutputSchema},
  prompt: `You are Sasha AI, an expert assistant with real-time knowledge of this CRM platform.
  Your current user's ID is {{userId}}.
  You have been provided with the full dataset for leads, tasks, users, financials, and today's attendance as JSON data. All financial data has been converted to USD for consistency. Use this data as your primary source of truth to answer any questions.

  Leads Data: {{{leadsJson}}}
  Tasks/Tickets Data: {{{tasksJson}}}
  Users Data: {{{usersJson}}}
  Financials Data (in USD): {{{financialsJson}}}
  Today's Attendance Data: {{{attendanceJson}}}


  Be helpful and provide detailed, actionable information based on the provided data.

  Examples:
  - "Show me all new leads"
  - "What tasks are assigned to Jane Doe?"
  - "Summarize the ticket about the Innovate Inc. follow-up"
  - "List all registered users"
  - "What was our biggest expense last month in USD?"
  - "Who has worked less than 2 hours today?"

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
    const financials: FinancialEntry[] = JSON.parse(input.financialsJson);
    const rates = await getExchangeRates('USD');

    const financialsInUsd = financials.map(entry => {
        if (entry.currency === 'USD' || !rates[entry.currency]) {
            return entry;
        }
        return {
            ...entry,
            amount: entry.amount / rates[entry.currency],
            currency: 'USD',
        };
    });

    const {output} = await prompt({
        ...input,
        financialsJson: JSON.stringify(financialsInUsd),
    });
    return output!;
  }
);
