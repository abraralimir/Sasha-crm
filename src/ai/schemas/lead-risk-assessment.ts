
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
