'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ProjectForm } from '@/components/projects/project-form';
import { ProjectCard } from '@/components/projects/project-card';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectsPage() {
  const firestore = useFirestore();
  const [isCreateProjectOpen, setCreateProjectOpen] = useState(false);

  const projectsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'projects');
  }, [firestore]);

  const { data: projects, isLoading } = useCollection<Project>(projectsCollection);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your client projects from start to finish.
          </p>
        </div>
        <Dialog open={isCreateProjectOpen} onOpenChange={setCreateProjectOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create a New Project</DialogTitle>
              <DialogDescription>
                Fill out the details below to set up a new project and generate an initial plan with AI.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm onFinished={() => setCreateProjectOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            A list of all active and completed projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}
             </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.sort((a,b) => b.startDate.toMillis() - a.startDate.toMillis()).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                <Layers className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No projects found.</p>
                <p className="text-sm text-muted-foreground">Get started by creating a new project.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
