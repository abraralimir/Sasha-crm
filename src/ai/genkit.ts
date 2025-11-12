import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import next from '@genkit-ai/next';

// This file configures the Genkit AI instance.
// It is NOT a server action file and should not have 'use server'.

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

export const ai = genkit({
  plugins: [
    next(),
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
      apiVersion: ['v1', 'v1beta'],
    }),
  ],
  model: 'gemini-1.5-flash', // Default model for all flows unless overridden
});
