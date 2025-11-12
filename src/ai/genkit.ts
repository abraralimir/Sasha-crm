import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import next from '@genkit-ai/next';

// This file configures the Genkit AI instance.
// It is NOT a server action file and should not have 'use server'.

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

// Define the specific, stable model we are using for all operations.
const model = 'models/gemini-2.0-flash-001';

export const ai = genkit({
  plugins: [
    next(),
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: model, // Default model for all flows unless overridden
});
