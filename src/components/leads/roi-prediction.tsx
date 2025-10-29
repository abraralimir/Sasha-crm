'use client';

import { useState } from 'react';
import { Bot, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { predictLeadROI } from '@/ai/flows/predict-lead-roi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { Lead } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

type Prediction = {
  predictedROI: number;
  confidenceLevel: string;
  reasoning: string;
};

export function RoiPrediction({ lead }: { lead: Lead }) {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePredict = async () => {
    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await predictLeadROI({
        leadDetails: lead.notes,
        historicalData: lead.historicalData,
        marketTrends: lead.marketTrends,
      });
      setPrediction(result);
    } catch (error) {
      console.error('ROI prediction error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to predict ROI for this lead.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confidenceColorMap: Record<string, string> = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-red-500',
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>ROI Prediction</CardTitle>
        </div>
        <CardDescription>
          Use Sasha AI to predict the potential Return on Investment for this lead.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[16rem] flex items-center justify-center">
        {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}

        {!isLoading && !prediction && (
            <div className="text-center">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Click below to generate a prediction.</p>
            </div>
        )}
        
        {!isLoading && prediction && (
          <div className="w-full space-y-4 text-center">
             <div className="relative flex justify-center items-end">
                <span className="text-7xl font-bold">{prediction.predictedROI}</span>
                <span className="text-3xl font-bold mb-1">%</span>
             </div>
             <div className="flex justify-center">
                <Badge variant="outline">
                    <span className={cn("w-2 h-2 mr-2 rounded-full", confidenceColorMap[prediction.confidenceLevel.toLowerCase()] || 'bg-gray-500')}></span>
                    Confidence: {prediction.confidenceLevel}
                </Badge>
             </div>
             <p className="text-sm text-muted-foreground px-4">{prediction.reasoning}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handlePredict} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {prediction ? 'Regenerate Prediction' : 'Predict ROI'}
        </Button>
      </CardFooter>
    </Card>
  );
}
