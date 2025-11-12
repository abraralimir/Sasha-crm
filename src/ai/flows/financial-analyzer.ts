
'use server';
/**
 * @fileoverview Defines a Genkit flow for analyzing financial data.
 * This flow takes a set of financial entries and provides a summary,
 * identifies trends, and highlights potential issues.
 */

import {ai} from '@/ai';
import {
  FinancialAnalysisInputSchema,
  FinancialAnalysisOutputSchema,
  type FinancialAnalysisInput,
  type FinancialAnalysisOutput,
} from '@/ai/schemas/financial-analyzer';

/**
 * An exported async function that wraps the Genkit flow.
 * This is the entry point for calling the financial analysis logic.
 * @param input The financial entries to be analyzed.
 * @returns A promise that resolves to the structured financial analysis.
 */
export async function analyzeFinancials(
  input: FinancialAnalysisInput
): Promise<FinancialAnalysisOutput> {
  return financialAnalysisFlow(input);
}

// Define the Genkit prompt for the AI model.
const prompt = ai.definePrompt(
    {
        name: 'financialAnalysisPrompt',
        input: {schema: FinancialAnalysisInputSchema},
        output: {schema: FinancialAnalysisOutputSchema},
        // The system prompt that instructs the AI on its role and task.
        prompt: `You are an expert financial analyst. Your task is to analyze the provided JSON data of financial entries.

Analyze the income, expenses, and investment patterns. Identify significant trends, spending habits, and areas of concern.

Based on your analysis, provide a concise summary of the overall financial health, list your key observations, and offer actionable insights to help improve the financial situation.

Financial Data:
{{{json entries}}}
`,
    }
);

// Define the Genkit flow that orchestrates the analysis.
const financialAnalysisFlow = ai.defineFlow(
  {
    name: 'financialAnalysisFlow',
    inputSchema: FinancialAnalysisInputSchema,
    outputSchema: FinancialAnalysisOutputSchema,
  },
  async input => {
    // Call the prompt with the input and wait for the response.
    const {output} = await prompt(input);

    // Return the structured output from the AI model.
    return output!;
  }
);
