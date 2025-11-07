'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Project } from '@/lib/types';
import { Loader2, Calendar, DollarSign, BrainCircuit, Flag, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const statusStyles = {
  "Not Started": "bg-gray-500",
  "In Progress": "bg-blue-500",
  "Completed": "bg-green-500",
  "On Hold": "bg-yellow-500",
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const firestore = useFirestore();

  const projectRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'projects', id as string);
  }, [firestore, id]);

  const { data: project, isLoading } = useDoc<Project>(projectRef);

  const calculateProgress = () => {
    if (!project) return 0;
    if (project.status === 'Completed') return 100;
    if (project.status === 'Not Started') return 0;

    const totalDuration = project.endDate.toDate().getTime() - project.startDate.toDate().getTime();
    if (totalDuration <= 0) return 0;

    const elapsedDuration = new Date().getTime() - project.startDate.toDate().getTime();
    const progress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));

    return progress;
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Card className="text-center">
            <CardHeader>
                <CardTitle>Project Not Found</CardTitle>
                <CardDescription>The project you are looking for does not exist.</CardDescription>
            </CardHeader>
        </Card>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.projectName}</h1>
          <p className="text-muted-foreground">For: {project.clientName}</p>
        </div>
        <Badge className={cn("w-fit text-base", statusStyles[project.status])}>
            <Flag className="mr-2 h-4 w-4"/>
            {project.status}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold">{format(project.startDate.toDate(), 'MMM d, yyyy')} - {format(project.endDate.toDate(), 'MMM d, yyyy')}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold">
                    {project.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}
                </div>
            </CardContent>
        </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <Progress value={progress} className="h-4" />
                 <p className="text-right text-xs text-muted-foreground mt-1">{Math.round(progress)}% complete</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/> Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                </CardContent>
            </Card>
             {project.aiGeneratedPlan && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary"/> AI-Generated Project Plan</CardTitle>
                        <CardDescription>An initial plan generated by Sasha AI to kickstart your project.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {project.aiGeneratedPlan.phases.map((phase, phaseIndex) => (
                            <div key={phaseIndex}>
                                <h4 className="font-semibold text-lg text-primary">{phase.phaseName}</h4>
                                <Separator className="my-2" />
                                <ul className="space-y-3 mt-4">
                                    {phase.tasks.map((task, taskIndex) => (
                                        <li key={taskIndex} className="p-3 bg-secondary/50 rounded-md">
                                            <p className="font-semibold">{task.taskName}</p>
                                            <p className="text-sm text-muted-foreground">{task.description}</p>
                                            <p className="text-xs font-mono text-right mt-1 text-primary">{task.durationDays} day(s)</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Team Members</CardTitle></CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>Team management coming soon.</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Project Tasks</CardTitle></CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>Project-specific task board coming soon.</p>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
