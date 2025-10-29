'use client';

import { useState } from 'react';
import { AlertTriangle, Bot, CheckCircle2, Loader2, ShieldAlert, Wand2, XCircle } from 'lucide-react';
import { assessLeadRisk, AssessLeadRiskOutput } from '@/ai/flows/assess-lead-risk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { Lead } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export function RiskAnalysis({ lead }: { lead: Lead }) {
  const [analysis, setAnalysis] = useState<AssessLeadRiskOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await assessLeadRisk({
        leadDetails: lead.notes,
        historicalData: lead.historicalData,
        marketTrends: lead.marketTrends,
      });
      setAnalysis(result);
    } catch (error) {
      console.error('Risk analysis error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to analyze risks for this lead.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const severityIcon: Record<string, React.ReactNode> = {
    low: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    medium: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    high: <XCircle className="h-4 w-4 text-red-500" />,
  }

  const getRiskColor = (score: number) => {
    if (score > 66) return 'bg-red-500';
    if (score > 33) return 'bg-yellow-500';
    return 'bg-green-500';
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <CardTitle>AI-Powered Risk Analysis</CardTitle>
        </div>
        <CardDescription>
          Evaluate whether to move forward by assessing lead and opportunity risks.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-h-[20rem] flex flex-col justify-center">
         {isLoading && <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}

        {!isLoading && !analysis && (
            <div className="text-center">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Click below to assess risks.</p>
            </div>
        )}

        {!isLoading && analysis && (
            <div className='space-y-4'>
                <div>
                    <div className='flex justify-between items-baseline mb-1'>
                        <span className='text-sm font-medium'>Overall Risk Score</span>
                        <span className='font-bold text-xl'>{analysis.overallRiskScore}<span className='text-sm text-muted-foreground'>/100</span></span>
                    </div>
                    <Progress value={analysis.overallRiskScore} className="h-2 [&>div]:bg-primary" />
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {analysis.riskFactors.map((risk, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>
                                <div className='flex items-center gap-2'>
                                {severityIcon[risk.severity] || <AlertTriangle className="h-4 w-4" />}
                                <span className='capitalize'>{risk.severity} Risk: {risk.factor}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {risk.mitigationStrategy}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                <Card className='bg-muted/50'>
                    <CardHeader className='p-4'>
                        <CardTitle className='text-base'>Sasha's Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent className='p-4 pt-0 text-sm text-muted-foreground'>
                        {analysis.recommendation}
                    </CardContent>
                </Card>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {analysis ? 'Re-analyze Risk' : 'Assess Risk'}
        </Button>
      </CardFooter>
    </Card>
  );
}
