import {createApiHandler} from '@genkit-ai/next';
import '@/ai';

export const runtime = 'nodejs';

export const {GET, POST} = createApiHandler();
