'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarClock, Loader2, Wand2 } from 'lucide-react';
import { generateProjectTimeline } from '@/ai/flows/generate-project-timeline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Lead } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

const formSchema = z.object({
  projectScope: z.string().min(20, 'Please provide a more detailed project scope.'),
  projectComplexity: z.enum(['Low', 'Medium', 'High']),
});

export function TimelineGenerator({ lead }: { lead: Lead }) {
  const [timeline, setTimeline] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectScope: lead.projectScope || '',
      projectComplexity: lead.projectComplexity || 'Medium',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setTimeline(null);
    try {
      const result = await generateProjectTimeline(values);
      setTimeline(result.timeline);
    } catch (error) {
      console.error('Timeline generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate a project timeline.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            <CardTitle>AI Timeline Generation</CardTitle>
        </div>
        <CardDescription>
          Generate a project timeline for proposals based on scope and complexity.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="timeline-form" className="space-y-4">
            <FormField
              control={form.control}
              name="projectScope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Scope</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the project goals and deliverables..." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectComplexity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Complexity</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select complexity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <div className="flex-1 rounded-md border bg-muted/50 p-4 min-h-[10rem]">
            {isLoading && (
                 <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
            )}
            {timeline && !isLoading && (
                <ScrollArea className="h-full max-h-64">
                    <pre className="whitespace-pre-wrap text-sm font-sans">{timeline}</pre>
                </ScrollArea>
            )}
            {!timeline && !isLoading && (
                <div className="flex items-center justify-center h-full text-center">
                    <p className="text-sm text-muted-foreground">Generated timeline will appear here.</p>
                </div>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="timeline-form" disabled={isLoading} className="w-full">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          {timeline ? 'Regenerate Timeline' : 'Generate Timeline'}
        </Button>
      </CardFooter>
    </Card>
  );
}
