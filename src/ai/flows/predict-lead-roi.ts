'use server';

/**
 * @fileOverview An AI agent for predicting the potential ROI of a lead.
 *
 * - predictLeadROI - A function that predicts the potential ROI of a lead.
 * - PredictLeadROIInput - The input type for the predictLeadROI function.
 * - PredictLeadROIOutput - The return type for the predictLeadROI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictLeadROIInputSchema = z.object({
  leadDetails: z
    .string()
    .describe('Detailed information about the lead, including industry, company size, and contact information.'),
  historicalData: z
    .string()
    .describe('Historical data related to similar leads, including conversion rates and revenue generated.'),
  marketTrends: z
    .string()
    .describe('Current market trends relevant to the lead industry.'),
});
export type PredictLeadROIInput = z.infer<typeof PredictLeadROIInputSchema>;

const PredictLeadROIOutputSchema = z.object({
  predictedROI: z
    .number()
    .describe('The predicted ROI for the lead, expressed as a percentage (e.g., 150.5 for 150.5%).'),
  confidenceLevel: z
    .enum(['High', 'Medium', 'Low'])
    .describe('A confidence level in the ROI prediction.'),
  reasoning: z
    .string()
    .describe('A detailed explanation of the factors and logic influencing the ROI prediction, referencing the provided context.'),
});
export type PredictLeadROIOutput = z.infer<typeof PredictLeadROIOutputSchema>;

export async function predictLeadROI(input: PredictLeadROIInput): Promise<PredictLeadROIOutput> {
  return predictLeadROIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictLeadROIPrompt',
  input: {schema: PredictLeadROIInputSchema},
  output: {schema: PredictLeadROIOutputSchema},
  prompt: `You are Sasha, a sophisticated AI analyst that predicts the potential Return on Investment (ROI) of a business lead. Your analysis must be grounded in the data provided.

CONTEXT:
- Lead Details: {{{leadDetails}}}
- Historical Data: {{{historicalData}}}
- Market Trends: {{{marketTrends}}}

INSTRUCTIONS:
1.  **Analyze Context:** Synthesize all provided information to forecast the potential ROI.
2.  **Predict ROI:** Calculate a specific 'predictedROI' value as a percentage.
3.  **Assess Confidence:** Determine a 'confidenceLevel' (High, Medium, or Low) based on the quality and alignment of the data.
4.  **Provide Reasoning:** Clearly explain your 'reasoning'. Justify how the lead details, market trends, and historical data contributed to your prediction.

Your output must be in the specified JSON format.
`,
  config: {
    temperature: 0.2,
  }
});

const predictLeadROIFlow = ai.defineFlow(
  {
    name: 'predictLeadROIFlow',
    inputSchema: PredictLeadROIInputSchema,
    outputSchema: PredictLeadROIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
