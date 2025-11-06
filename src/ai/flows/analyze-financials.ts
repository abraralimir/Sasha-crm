'use server';

/**
 * @fileOverview AI agent for analyzing financial data.
 *
 * - analyzeFinancials - A function that provides insights on financial data.
 * - AnalyzeFinancialsInput - The input type for the analyzeFinancials function.
 * - AnalyzeFinancialsOutput - The return type for the analyzeFinancials function.
 */

import {ai} from '@/ai/genkit';
import { getExchangeRates } from '@/lib/currency';
import type { FinancialEntry } from '@/lib/types';
import {z} from 'genkit';

const AnalyzeFinancialsInputSchema = z.object({
  financialsJson: z
    .string()
    .describe('A JSON string representing all financial entries in the system (income, expenses, investments).'),
});
export type AnalyzeFinancialsInput = z.infer<typeof AnalyzeFinancialsInputSchema>;

const AnalyzeFinancialsOutputSchema = z.object({
  keyInsights: z.array(
    z.object({
        title: z.string().describe("The title of the insight."),
        explanation: z.string().describe("A detailed explanation of the insight."),
        recommendation: z.string().optional().describe("An actionable recommendation based on the insight."),
    })
  ).describe("A list of key insights discovered from the financial data."),
  financialSummary: z.object({
    totalRevenue: z.number().describe('Total calculated revenue in USD.'),
    totalExpenses: z.number().describe('Total calculated expenses in USD.'),
    netProfit: z.number().describe('Calculated net profit or loss (revenue - expenses) in USD.'),
    burnRate: z.number().optional().describe('The rate at which the company is spending its capital.'),
  }).describe("A summary of the key financial metrics, all converted to USD."),
  overallAssessment: z.string().describe("A brief, overall assessment of the financial health."),
});
export type AnalyzeFinancialsOutput = z.infer<typeof AnalyzeFinancialsOutputSchema>;

export async function analyzeFinancials(input: AnalyzeFinancialsInput): Promise<AnalyzeFinancialsOutput> {
  return analyzeFinancialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFinancialsPrompt',
  input: {schema: z.object({ financialsJson: z.string() })},
  output: {schema: AnalyzeFinancialsOutputSchema},
  prompt: `You are Sasha, an expert financial analyst AI for a startup. Your task is to analyze the company's financial data and provide a clear, insightful report for the management team.

  All financial figures in the provided data have been converted to USD for consistent analysis. Use this data as your primary source of truth.

  Financials Data (in USD): {{{financialsJson}}}

  Based on this data, perform the following:
  1.  Calculate the core metrics: Total Revenue (from 'Income' entries), Total Expenses (from 'Expense' entries), and Net Profit/Loss. All values are in USD.
  2.  Identify at least 2-3 key insights. These could be about spending patterns, revenue trends, or profitability. For each insight, provide a title, a clear explanation, and an actionable recommendation if applicable.
  3.  Provide a concise, high-level "Overall Assessment" of the company's financial health.
  4.  If possible, estimate the monthly burn rate based on expense data.

  Present the information in a structured, easy-to-understand format. Be objective and data-driven in your analysis.
  `,
});

const analyzeFinancialsFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialsFlow',
    inputSchema: AnalyzeFinancialsInputSchema,
    outputSchema: AnalyzeFinancialsOutputSchema,
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

    const {output} = await prompt({ financialsJson: JSON.stringify(financialsInUsd) });
    return output!;
  }
);
