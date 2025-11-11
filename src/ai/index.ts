'use server';
import { config } from 'dotenv';
config();

import './flows/ai-chat-with-file-context.ts';
import './flows/generate-project-timeline.ts';
import './flows/platform-aware-ai-chat.ts';
import './flows/predict-lead-roi.ts';
import './flows/assess-lead-risk.ts';
import './flows/analyze-financials.ts';
import './flows/facial-verification.ts';

import { genkit } from 'genkit';
