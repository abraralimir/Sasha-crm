
import {z} from 'zod';

// Define the schema for a single financial entry.
const FinancialEntrySchema = z.object({
  description: z.string(),
  amount: z.number(),
  type: z.enum(['Income', 'Expense', 'Investment']),
  category: z.string(),
  date: z.string().describe('Date in ISO format'),
  currency: z.string(),
});

// Define the schema for the input, which is a list of financial entries.
export const FinancialAnalysisInputSchema = z.object({
  entries: z.array(FinancialEntrySchema),
});
export type FinancialAnalysisInput = z.infer<
  typeof FinancialAnalysisInputSchema
>;

// Define the schema for the output of the analysis.
export const FinancialAnalysisOutputSchema = z.object({
  summary: z.string().describe('A brief, one-paragraph overview of the financial health.'),
  keyObservations: z.array(z.string()).describe('A list of 3-5 key observations or trends found in the data.'),
  actionableInsights: z.array(z.string()).describe('A list of 2-3 specific, actionable recommendations based on the analysis.'),
});
export type FinancialAnalysisOutput = z.infer<
  typeof FinancialAnalysisOutputSchema
>;
