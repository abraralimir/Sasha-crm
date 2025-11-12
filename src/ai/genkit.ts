/**
 * @fileoverview This file configures the Genkit AI instance.
 * It sets up the Google AI plugin and defines the default model
 * for all generative AI operations across the application.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import next from '@genkit-ai/next';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

// Initialize Genkit with the Google AI plugin.
// The default model is set to 'gemini-1.5-flash', which is a stable and
// performant choice for web applications in the free tier.
export const ai = genkit({
  plugins: [
    next(),
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'gemini-1.5-flash',
});
