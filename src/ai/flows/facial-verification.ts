'use server';

/**
 * @fileoverview Defines a Genkit flow for performing facial verification.
 *
 * This flow takes a live camera image and compares it against a trusted
 * reference image of a user to determine if they are the same person.
 * It is designed for security checkpoints within the application.
 */

import {ai} from '@/ai';
import {
  FacialVerificationInputSchema,
  FacialVerificationOutputSchema,
  type FacialVerificationInput,
  type FacialVerificationOutput,
} from '@/ai/schemas/facial-verification';

/**
 * An exported async function that wraps the Genkit flow.
 * This is the entry point for calling the facial verification logic from the application.
 * @param input The live and reference images for comparison.
 * @returns A promise that resolves to the verification result.
 */
export async function verifyFace(
  input: FacialVerificationInput
): Promise<FacialVerificationOutput> {
  return facialVerificationFlow(input);
}


// Define the Genkit prompt for the AI model.
const prompt = ai.definePrompt(
  {
    name: 'facialVerificationPrompt',
    input: {schema: FacialVerificationInputSchema},
    output: {schema: FacialVerificationOutputSchema},
    // Use a specific model configuration for this prompt.
    // The gemini-2.0-flash model is the stable choice.
    // Temperature is set to 0.0 for deterministic, fact-based analysis.
    config: {
      model: 'gemini-2.0-flash',
      temperature: 0.0,
    },
    // The system prompt that instructs the AI on its role and task.
    prompt: `You are a highly advanced facial recognition AI system. Your task is to determine if the person in the "live" image is the same person as in the "reference" image.

Analyze the key facial features in both images: face shape, eyes, nose, mouth, and any unique identifiers.

- If they are a clear match, set isMatch to true.
- If they are clearly different people, set isMatch to false.
- Be decisive. Do not be overly cautious. If the resemblance is strong, it's a match.

Provide a brief, one-sentence reasoning for your decision.

Live Image:
{{media url=liveImage}}

Reference Image:
{{media url=referenceImage}}
`,
  },
);

// Define the Genkit flow that orchestrates the verification process.
const facialVerificationFlow = ai.defineFlow(
  {
    name: 'facialVerificationFlow',
    inputSchema: FacialVerificationInputSchema,
    outputSchema: FacialVerificationOutputSchema,
  },
  async input => {
    // Call the prompt with the input and wait for the response.
    const {output} = await prompt(input);
    
    // Return the structured output from the AI model.
    // The '!' asserts that the output will not be null.
    return output!;
  }
);
