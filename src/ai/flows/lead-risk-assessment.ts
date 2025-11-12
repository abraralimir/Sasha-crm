'use server';

/**
 * @fileoverview Defines a Genkit flow for assessing the risk and potential ROI of a sales lead.
 */

import {ai} from '@/ai';
import {z} from 'zod';

// Define the schema for the input, which represents a single sales lead.
export const LeadAssessmentInputSchema = z.object({
  contactName: z.string(),
  companyName: z.string(),
  email: z.string().email(),
  status: z.enum(['New', 'Contacted', 'Proposal', 'Closed', 'Lost']),
  potentialRevenue: z.number().optional(),
  lastContacted: z.string().optional().describe('Date in ISO format'),
});
export type LeadAssessmentInput = z.infer<typeof LeadAssessmentInputSchema>;

// Define the schema for the output of the assessment.
export const LeadAssessmentOutputSchema = z.object({
  riskScore: z.number().min(0).max(100).describe('A risk score from 0 (low risk) to 100 (high risk).'),
  estimatedRoi: z.number().min(0).max(100).describe('An estimated Return on Investment (ROI) score from 0 to 100.'),
  reasoning: z.string().describe('A brief explanation for the assigned scores, highlighting key factors.'),
});
export type LeadAssessmentOutput = z.infer<typeof LeadAssessmentOutputSchema>;


/**
 * An exported async function that wraps the Genkit flow.
 * This is the entry point for calling the lead assessment logic.
 * @param input The lead data to be assessed.
 * @returns A promise that resolves to the risk and ROI assessment.
 */
export async function assessLead(
  input: LeadAssessmentInput
): Promise<LeadAssessmentOutput> {
  return leadAssessmentFlow(input);
}


// Define the Genkit prompt for the AI model.
const prompt = ai.definePrompt(
  {
    name: 'leadAssessmentPrompt',
    input: {schema: LeadAssessmentInputSchema},
    output: {schema: LeadAssessmentOutputSchema},
    prompt: `You are an expert sales analyst specializing in lead qualification. Your task is to assess a sales lead based on the provided data.

Analyze the lead's status, potential revenue, and other factors to determine its risk and potential ROI.
- A "New" lead with high potential revenue is promising but has some risk.
- A "Proposal" status indicates lower risk.
- A "Contacted" status with no recent activity might be higher risk.
- Lack of potential revenue data increases risk.

Calculate a 'riskScore' and an 'estimatedRoi' score from 0-100 and provide a brief reasoning.

Lead Data:
{{{json input}}}
`,
  },
);

// Define the Genkit flow that orchestrates the assessment.
const leadAssessmentFlow = ai.defineFlow(
  {
    name: 'leadAssessmentFlow',
    inputSchema: LeadAssessmentInputSchema,
    outputSchema: LeadAssessmentOutputSchema,
  },
  async input => {
    // Call the prompt with the input and wait for the response.
    const {output} = await prompt(input);
    
    // Return the structured output from the AI model.
    return output!;
  }
);
