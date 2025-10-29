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
    .describe('The predicted ROI for the lead, expressed as a percentage.'),
  confidenceLevel: z
    .string()
    .describe('A description of the confidence level in the ROI prediction (e.g., high, medium, low).'),
  reasoning: z
    .string()
    .describe('Explanation of the factors influencing the ROI prediction.'),
});
export type PredictLeadROIOutput = z.infer<typeof PredictLeadROIOutputSchema>;

export async function predictLeadROI(input: PredictLeadROIInput): Promise<PredictLeadROIOutput> {
  return predictLeadROIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictLeadROIPrompt',
  input: {schema: PredictLeadROIInputSchema},
  output: {schema: PredictLeadROIOutputSchema},
  prompt: `You are an AI assistant that predicts the potential ROI of a lead based on historical data and market trends.

  Consider the following information about the lead:
  Lead Details: {{{leadDetails}}}
  Historical Data: {{{historicalData}}}
  Market Trends: {{{marketTrends}}}

  Based on this information, predict the potential ROI for the lead, express the ROI as a percentage. Also include a confidence level (high, medium, low), and reason for the prediction.
  Ensure that the predictedROI is a number.
  `,
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
