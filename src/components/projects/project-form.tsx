'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, Timestamp, addDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CalendarIcon, BrainCircuit } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { UserProfile, GeneratedPlan } from '@/lib/types';
import { DateRange } from 'react-day-picker';
import { useState } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { generateProjectTimeline } from '@/ai/flows/generate-project-timeline';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const formSchema = z.object({
  projectName: z.string().min(3, 'Project name is required.'),
  clientName: z.string().min(2, 'Client name is required.'),
  description: z.string().min(10, 'Please provide a detailed description.'),
  dates: z.object({
      from: z.date({ required_error: 'Start date is required.'}),
      to: z.date({ required_error: 'End date is required.'})
  }),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'On Hold']),
  budget: z.coerce.number().positive('Budget must be a positive number.').optional(),
});

type ProjectFormProps = {
  project?: any;
  onFinished?: () => void;
};

export function ProjectForm({ project, onFinished }: ProjectFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentUser } = useUser();
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: project?.projectName || '',
      clientName: project?.clientName || '',
      description: project?.description || '',
      status: project?.status || 'Not Started',
    },
  });

  const handleGeneratePlan = async () => {
      const { description } = form.getValues();
      if (!description) {
          toast({
              variant: 'destructive',
              title: 'Description Needed',
              description: 'Please fill out the project description to generate a plan.'
          });
          return;
      }
      setIsAiLoading(true);
      setGeneratedPlan(null);
      try {
          const result = await generateProjectTimeline({ projectScope: description, projectComplexity: "Medium" });
          const plan = JSON.parse(result.timeline);
          setGeneratedPlan(plan);
           toast({
              title: 'AI Plan Generated',
              description: 'A project plan has been structured below.',
          });
      } catch (error) {
          console.error("AI plan generation error:", error);
          toast({ variant: 'destructive', title: 'AI Error', description: 'Failed to parse the AI-generated plan. Please try again.' });
      } finally {
          setIsAiLoading(false);
      }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;

    const payload = {
      ...values,
      startDate: Timestamp.fromDate(values.dates.from),
      endDate: Timestamp.fromDate(values.dates.to),
      team: [], // Not implemented yet
    };
    delete (payload as any).dates;

    try {
      const projectsCollection = collection(firestore, 'projects');
      await addDoc(projectsCollection, payload);
      toast({
        title: 'Project Created',
        description: `The project "${values.projectName}" has been successfully created.`,
      });
      form.reset();
      onFinished?.();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create project.' });
    }
  };

  return (
      <ScrollArea className="max-h-[80vh]">
        <div className="pr-6 pl-1">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="projectName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl><Input placeholder="e.g., New Corporate Website" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Innovate Inc." {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Project Description & Scope</FormLabel>
                    <FormControl><Textarea rows={4} placeholder="Describe the project goals, deliverables, and key features..." {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="dates"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Project Dates</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value?.from && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value?.from ? (
                                            field.value.to ? (
                                                <>
                                                {format(field.value.from, "LLL dd, y")} -{" "}
                                                {format(field.value.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(field.value.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date range</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="range"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Budget ($)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="10000" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="On Hold">On Hold</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-4 space-y-4">
                    <Button type="button" variant="outline" className="w-full" onClick={handleGeneratePlan} disabled={isAiLoading}>
                        {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                        Generate Project Plan with AI
                    </Button>

                    {generatedPlan && (
                        <Card>
                            <CardHeader>
                                <CardTitle>AI-Generated Project Plan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {generatedPlan.phases.map((phase, phaseIndex) => (
                                    <div key={phaseIndex}>
                                        <h4 className="font-semibold text-primary">{phase.phaseName}</h4>
                                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                                            {phase.tasks.map((task, taskIndex) => (
                                                <li key={taskIndex}>
                                                    <span className="font-medium text-foreground">{task.taskName}</span> - {task.description} ({task.durationDays} days)
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Project'}
                </Button>
            </form>
            </Form>
        </div>
    </ScrollArea>
  );
}
