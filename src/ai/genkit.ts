import {genkit} from 'genkit';
import {gemini, googleAI} from '@genkit-ai/google-genai';
import next from '@genkit-ai/next';

// This file configures the Genkit AI instance.
// It is NOT a server action file and should not have 'use server'.

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set.');
}

// Define the specific, stable model we are using for all operations.
const model = gemini('gemini-2.0-flash');

export const ai = genkit({
  plugins: [
    next(),
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
      // Pass the defined model to the plugin configuration.
      models: [model],
    }),
  ],
});
