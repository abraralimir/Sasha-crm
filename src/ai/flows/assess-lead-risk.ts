'use server';

/**
 * @fileOverview AI-powered risk assessment for leads.
 *
 * - assessLeadRisk - A function to assess the risks associated with a lead.
 * - AssessLeadRiskInput - The input type for the assessLeadRisk function.
 * - AssessLeadRiskOutput - The return type for the assessLeadRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessLeadRiskInputSchema = z.object({
  leadDetails: z.string().describe('Comprehensive details about the lead, including industry, size, history, and key contacts.'),
  marketTrends: z.string().describe('Current market trends and competitive landscape relevant to the lead.'),
  historicalData: z.string().describe('Historical performance data related to similar leads and projects.'),
});
export type AssessLeadRiskInput = z.infer<typeof AssessLeadRiskInputSchema>;

const AssessLeadRiskOutputSchema = z.object({
  overallRiskScore: z.number().describe('A numerical score representing the overall risk level of the lead (0-100).'),
  riskFactors: z.array(
    z.object({
      factor: z.string().describe('Specific risk factor identified (e.g., market volatility, financial instability).'),
      severity: z.enum(['low', 'medium', 'high']).describe('Severity level of the risk factor.'),
      mitigationStrategy: z.string().optional().describe('Suggested strategy to mitigate the risk factor.'),
    })
  ).describe('Detailed breakdown of risk factors and their potential impact.'),
  recommendation: z.string().describe('Overall recommendation on whether to pursue the lead based on the risk assessment.'),
});
export type AssessLeadRiskOutput = z.infer<typeof AssessLeadRiskOutputSchema>;

export async function assessLeadRisk(input: AssessLeadRiskInput): Promise<AssessLeadRiskOutput> {
  return assessLeadRiskFlow(input);
}

const assessLeadRiskPrompt = ai.definePrompt({
  name: 'assessLeadRiskPrompt',
  input: {schema: AssessLeadRiskInputSchema},
  output: {schema: AssessLeadRiskOutputSchema},
  prompt: `You are Sasha, an AI consultant specializing in risk assessment for business leads. Analyze the provided lead details, market trends, and historical data to determine the overall risk and provide recommendations.

Lead Details: {{{leadDetails}}}
Market Trends: {{{marketTrends}}}
Historical Data: {{{historicalData}}}

Based on this information, assess the risk factors, assign an overall risk score (0-100), and provide a recommendation on whether to pursue the lead. Highlight any critical risks that require immediate attention.

Ensure that the riskFactors array contains specific and concrete actionable information for the user.
`,
});

const assessLeadRiskFlow = ai.defineFlow(
  {
    name: 'assessLeadRiskFlow',
    inputSchema: AssessLeadRiskInputSchema,
    outputSchema: AssessLeadRiskOutputSchema,
  },
  async input => {
    const {output} = await assessLeadRiskPrompt(input);
    return output!;
  }
);
