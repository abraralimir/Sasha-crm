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
  overallRiskScore: z.number().min(0).max(100).describe('A numerical score representing the overall risk level of the lead (0-100), where 0 is no risk and 100 is maximum risk.'),
  riskFactors: z.array(
    z.object({
      factor: z.string().describe('Specific risk factor identified (e.g., market volatility, financial instability, high competition).'),
      severity: z.enum(['low', 'medium', 'high']).describe('Severity level of the risk factor.'),
      mitigationStrategy: z.string().optional().describe('A concrete, suggested strategy to mitigate this specific risk factor.'),
    })
  ).describe('Detailed breakdown of identified risk factors and their potential impact.'),
  recommendation: z.string().describe('A clear, overall recommendation on whether to pursue the lead (e.g., "Pursue with caution," "High-priority target," "Not recommended at this time").'),
});
export type AssessLeadRiskOutput = z.infer<typeof AssessLeadRiskOutputSchema>;

export async function assessLeadRisk(input: AssessLeadRiskInput): Promise<AssessLeadRiskOutput> {
  return assessLeadRiskFlow(input);
}

const assessLeadRiskPrompt = ai.definePrompt({
  name: 'assessLeadRiskPrompt',
  input: {schema: AssessLeadRiskInputSchema},
  output: {schema: AssessLeadRiskOutputSchema},
  prompt: `You are Sasha, a meticulous AI consultant specializing in B2B lead risk assessment. Your task is to analyze the provided information and produce a structured risk profile.

CONTEXT:
- Lead Details: {{{leadDetails}}}
- Market Trends: {{{marketTrends}}}
- Historical Data: {{{historicalData}}}

INSTRUCTIONS:
1.  **Analyze Holistically:** Synthesize all provided context to identify potential risks.
2.  **Calculate Risk Score:** Assign an 'overallRiskScore' from 0 (very low risk) to 100 (very high risk) based on the combined weight of all factors.
3.  **Identify Specific Factors:** Detail each risk in the 'riskFactors' array. Each factor must have a 'factor' name, a 'severity' level, and a concrete 'mitigationStrategy' if applicable.
4.  **Formulate Recommendation:** Based on your analysis, provide a clear, actionable 'recommendation'.

Ensure your output is in the specified JSON format and that the analysis is sharp, objective, and provides real business value.
`,
  config: {
    temperature: 0.4,
  }
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
