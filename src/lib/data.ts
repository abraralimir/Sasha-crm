import type { Kpi, Lead } from '@/lib/types';
import { PlaceHolderImages } from './placeholder-images';

export function getLeadById(id: string): Lead | undefined {
  // This function will need to be updated to fetch from Firestore
  return undefined;
}

export const getAvatars = () => {
    return PlaceHolderImages.reduce((acc, img) => {
        acc[img.id] = img.imageUrl;
        return acc;
    }, {} as Record<string, string>);
}
