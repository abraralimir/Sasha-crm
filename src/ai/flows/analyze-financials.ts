'use server';

/**
 * @fileOverview AI agent for analyzing financial data.
 *
 * - analyzeFinancials - A function that provides insights on financial data.
 * - AnalyzeFinancialsInput - The input type for the analyzeFinancials function.
 * - AnalyzeFinancialsOutput - The return type for the analyzeFinancials function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeFinancialsInputSchema = z.object({
  financialsJson: z
    .string()
    .describe('A JSON string representing all financial entries in the system (income, expenses, investments). Note: Entries can be in different currencies (USD, AED, INR).'),
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
  }).describe("A summary of the key financial metrics. IMPORTANT: You MUST convert all currencies to a single currency (USD) for this summary. Use approximate conversion rates if necessary (e.g., 1 AED = 0.27 USD, 1 INR = 0.012 USD)."),
  overallAssessment: z.string().describe("A brief, overall assessment of the financial health."),
});
export type AnalyzeFinancialsOutput = z.infer<typeof AnalyzeFinancialsOutputSchema>;

export async function analyzeFinancials(input: AnalyzeFinancialsInput): Promise<AnalyzeFinancialsOutput> {
  return analyzeFinancialsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeFinancialsPrompt',
  input: {schema: AnalyzeFinancialsInputSchema},
  output: {schema: AnalyzeFinancialsOutputSchema},
  prompt: `You are Sasha, an expert financial analyst AI for a startup. Your task is to analyze the company's financial data and provide a clear, insightful report for the management team.

  The provided financial data may contain entries in multiple currencies (USD, AED, INR). You MUST convert all amounts to a single currency (USD) before calculating summary metrics. Use the following approximate conversion rates for your calculations:
  - 1 AED = 0.27 USD
  - 1 INR = 0.012 USD

  Your analysis should be sharp, data-driven, and tailored for a business audience. Focus on clarity and actionable advice.

  Financials Data: {{{financialsJson}}}

  Based on this data, perform the following:
  1.  Calculate the core metrics for the financialSummary: Total Revenue, Total Expenses, and Net Profit/Loss. ALL values in the summary must be in USD.
  2.  Identify at least 2-3 key insights. These should be non-obvious and impactful (e.g., "High correlation between marketing spend in Q2 and a spike in INR revenue" or "Recurring software subscriptions account for 60% of monthly burn"). For each insight, provide a title, a clear explanation, and an actionable recommendation.
  3.  Provide a concise, high-level "Overall Assessment" of the company's financial health. Is it stable, growing, or at risk?
  4.  If possible, estimate the monthly burn rate based on expense data.

  Present the information in the required structured JSON format. Be objective and data-driven in your analysis.
  `,
  config: {
    temperature: 0.3,
  }
});

const analyzeFinancialsFlow = ai.defineFlow(
  {
    name: 'analyzeFinancialsFlow',
    inputSchema: AnalyzeFinancialsInputSchema,
    outputSchema: AnalyzeFinancialsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
