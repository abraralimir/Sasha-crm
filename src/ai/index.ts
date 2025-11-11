'use server';
<<<<<<< HEAD
import '@/ai/flows/ai-chat-with-file-context.ts';
import '@/ai/flows/generate-project-timeline.ts';
import '@/ai/flows/platform-aware-ai-chat.ts';
import '@/ai/flows/predict-lead-roi.ts';
import '@/ai/flows/assess-lead-risk.ts';
import '@/ai/flows/analyze-financials.ts';
import '@/ai/flows/facial-verification.ts';
=======
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
>>>>>>> 650df4b (ok ive rolled back to 9f11e97 now do some friedly and gentle changes ver)
