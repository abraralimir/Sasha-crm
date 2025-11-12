
import {z} from 'zod';

// Define the schema for the input, which includes two image data URIs.
export const FacialVerificationInputSchema = z.object({
  liveImage: z
    .string()
    .describe(
      "A live photo captured from the device's camera, as a data URI that must include a MIME type and use Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  referenceImage: z
    .string()
    .describe(
      "The trusted reference photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type FacialVerificationInput = z.infer<
  typeof FacialVerificationInputSchema
>;

// Define the schema for the output, which contains the verification result.
export const FacialVerificationOutputSchema = z.object({
  isMatch: z
    .boolean()
    .describe('Whether the person in the live image is the same as in the reference image.'),
  reasoning: z
    .string()
    .describe('A brief explanation of the decision, noting similarities or differences.'),
});
export type FacialVerificationOutput = z.infer<
  typeof FacialVerificationOutputSchema
>;
