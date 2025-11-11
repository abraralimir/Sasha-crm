import {createApiHandler} from '@genkit-ai/nextjs';
import '@/ai';

export const runtime = 'nodejs';

export const {GET, POST} = createApiHandler();
