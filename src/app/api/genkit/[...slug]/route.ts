import {createApiHandler} from '@genkit-ai/next';
import '@/ai';

export const runtime = 'nodejs';

export const GET = createApiHandler();
export const POST = createApiHandler();
