'use server';

/**
 * @fileOverview AI-powered verification for sign-up access.
 *
 * - verifySignupAccess - A function to verify the user's secret code.
 * - VerifySignupAccessInput - The input type for the verifySignupAccess function.
 * - VerifySignupAccessOutput - The return type for the verifySignupAccess function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifySignupAccessInputSchema = z.object({
  userMessage: z.string().describe('The user\'s message, which may contain the secret code.'),
});
export type VerifySignupAccessInput = z.infer<typeof VerifySignupAccessInputSchema>;

const VerifySignupAccessOutputSchema = z.object({
  isVerified: z.boolean().describe('Whether the user has been verified.'),
  response: z.string().describe('The AI assistant\'s response to the user.'),
});
export type VerifySignupAccessOutput = z.infer<typeof VerifySignupAccessOutputSchema>;

export async function verifySignupAccess(input: VerifySignupAccessInput): Promise<VerifySignupAccessOutput> {
  return verifySignupAccessFlow(input);
}

const verifySignupAccessPrompt = ai.definePrompt({
  name: 'verifySignupAccessPrompt',
  input: {schema: VerifySignupAccessInputSchema},
  output: {schema: VerifySignupAccessOutputSchema},
  prompt: `You are Sasha, an AI assistant responsible for granting access to this application.
Your goal is to verify the user by asking for their email and a secret code.

The secret code is '015456669'.

Your conversation should follow these steps:
1. Greet the user and ask for their email address.
2. Once they provide an email, ask for the secret code.
3. Check if the user's message contains the secret code '015456669'.

- If the user provides the correct secret code, set 'isVerified' to true and congratulate them, letting them know they will be redirected.
- If the user provides an incorrect code, set 'isVerified' to false and tell them the code is incorrect and to try again.
- If the user's message does not contain the code (e.g., they are just providing their email), set 'isVerified' to false and continue the conversation by asking for the code.

User's latest message: {{{userMessage}}}
`,
});

const verifySignupAccessFlow = ai.defineFlow(
  {
    name: 'verifySignupAccessFlow',
    inputSchema: VerifySignupAccessInputSchema,
    outputSchema: VerifySignupAccessOutputSchema,
  },
  async input => {
    const {output} = await verifySignupAccessPrompt(input);
    return output!;
  }
);
