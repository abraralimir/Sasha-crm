<<<<<<< HEAD
import {createApiHandler} from '@genkit-ai/next';
=======
import { createApiHandler } from '@genkit-ai/next';
>>>>>>> 650df4b (ok ive rolled back to 9f11e97 now do some friedly and gentle changes ver)
import '@/ai';

export const runtime = 'nodejs';

<<<<<<< HEAD
export const {GET, POST} = createApiHandler();
=======
export const { GET, POST, OPTIONS } = createApiHandler();
>>>>>>> 650df4b (ok ive rolled back to 9f11e97 now do some friedly and gentle changes ver)
