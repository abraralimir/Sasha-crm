'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {config} from 'dotenv';

config();

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
      apiVersion: ['v1', 'v1beta'],
    }),
  ],
  model: 'gemini-1.5-flash', // Default model for all flows unless overridden
});
