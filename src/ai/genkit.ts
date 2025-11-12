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
export const ai = genkit({
  plugins: [
    next(),
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: 'googleai/gemini-2.5-flash-lite', // Use the reliable, lightweight prefixed alias
});
