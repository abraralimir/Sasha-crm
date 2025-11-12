'use server';

/**
 * @fileOverview An AI agent for performing facial recognition verification.
 *
 * - facialVerification - a function that compares two images to verify a user's identity.
 * - FacialVerificationInput - The input type for the facialVerification function.
 * - FacialVerificationOutput - The return type for the facialVerification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FacialVerificationInputSchema = z.object({
  capturedImageUri: z
    .string()
    .describe(
      "The newly captured image of the user from the webcam, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  referenceImageUrl: z
    .string()
    .describe(
      'The trusted, stored reference image URL for the user.'
    ),
});
export type FacialVerificationInput = z.infer<
  typeof FacialVerificationInputSchema
>;

const FacialVerificationOutputSchema = z.object({
  isMatch: z
    .boolean()
    .describe('Whether the person in the captured image is a match to the person in the reference image. This MUST be false unless confidence is extremely high.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('A confidence score (0-1) for the verification result. Be conservative.'),
});
export type FacialVerificationOutput = z.infer<
  typeof FacialVerificationOutputSchema
>;

export async function facialVerification(
  input: FacialVerificationInput
): Promise<FacialVerificationOutput> {
  return facialVerificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'facialVerificationPrompt',
  input: { schema: FacialVerificationInputSchema },
  output: { schema: FacialVerificationOutputSchema },
  prompt: `You are an advanced AI security agent specializing in facial recognition. Your task is to determine if two images are of the same person with a very high degree of certainty.

- Image A is a live photo just captured from a webcam.
- Image B is a trusted reference photo stored in the system.

Captured Image (Image A): {{media url=capturedImageUri}}
Reference Image (Image B): {{media url=referenceImageUrl}}

Analyze both images carefully. Pay attention to key facial features, structure, and any distinguishing marks. Account for potential variations in lighting, angle, and expression.

Your response must be extremely strict. If you are not highly confident, you MUST return 'false' for 'isMatch'. A successful match requires an exceptionally high degree of similarity. It is better to have a false negative than a false positive.

Based on your analysis, determine if the person in Image A is the same as the person in Image B and provide a confidence score.
`,
  config: {
    model: 'gemini-1.5-flash-latest', // Use a model optimized for vision
    temperature: 0.0, // Be deterministic for security checks
  }
});

const facialVerificationFlow = ai.defineFlow(
  {
    name: 'facialVerificationFlow',
    inputSchema: FacialVerificationInputSchema,
    outputSchema: FacialVerificationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
