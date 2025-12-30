'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, query, where, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp, deleteDoc } from 'firebase/firestore';
import type { Project, ProjectTask, UserProfile } from '@/lib/types';
import { Loader2, Calendar, DollarSign, BrainCircuit, Flag, Info, Users, Plus, Minus, ClipboardList, Trash2, AlertTriangle, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProjectTaskForm } from '@/components/projects/project-task-form';
import { useState } from 'react';
import { TaskColumn } from '@/components/tickets/task-column';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


const statusStyles = {
  "Not Started": "bg-gray-500",
  "In Progress": "bg-blue-500",
  "Completed": "bg-green-500",
  "On Hold": "bg-yellow-500",
};

const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user: currentUser } = useUser();

  const [isTaskFormOpen, setTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ProjectTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<ProjectTask | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  const projectQuery = useMemoFirebase(() => {
    if (!firestore || !slug) return null;
    return query(collection(firestore, 'projects'), where('slug', '==', slug as string));
  }, [firestore, slug]);
  
  const { data: projects, isLoading: projectLoading } = useCollection<Project>(projectQuery);
  const project = projects?.[0];

  const allUsersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: allUsers, isLoading: usersLoading } = useCollection<UserProfile>(allUsersCollection);

  const projectTasksCollection = useMemoFirebase(() => {
    if (!firestore || !project) return null;
    return collection(firestore, 'projects', project.id, 'tasks');
  }, [firestore, project]);
  const { data: projectTasks, isLoading: tasksLoading } = useCollection<ProjectTask>(projectTasksCollection);

  const handleToggleTeamMember = async (userId: string) => {
    if (!firestore || !project || !currentUser) return;
    const projectRef = doc(firestore, 'projects', project.id);
    const isMember = project.team.includes(userId);
    const userToUpdate = allUsers?.find(u => u.id === userId);
    
    try {
      if (isMember) {
        await updateDoc(projectRef, { team: arrayRemove(userId) });
        toast({ title: 'Team Member Removed', description: `${userToUpdate?.name} has been removed from the project.` });
      } else {
        await updateDoc(projectRef, { team: arrayUnion(userId) });
        toast({ title: 'Team Member Added', description: `${userToUpdate?.name} has been added to the project.` });
        
        // Create notification for the added user
        if (userToUpdate) {
            const notificationPayload = {
                title: `You've been added to a project`,
                message: `You are now a member of "${project.projectName}".`,
                link: `/projects/${project.slug}`,
                read: false,
                createdAt: serverTimestamp(),
            };
            const notificationRef = collection(firestore, 'users', userId, 'notifications');
            addDocumentNonBlocking(notificationRef, notificationPayload);
        }
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update team members.' });
    }
  };

  const handleTaskDrop = async (taskId: string, newStatus: 'To Do' | 'In Progress' | 'Done') => {
    if (!firestore || !project) return;
    const taskRef = doc(firestore, `projects/${project.id}/tasks`, taskId);
    try {
      await updateDoc(taskRef, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };
  
  const openDeleteDialog = (taskId: string) => {
    const task = projectTasks?.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setIsAlertOpen(true);
    }
  };
  
  const openEditDialog = (task: ProjectTask) => {
    setTaskToEdit(task);
    setTaskFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!firestore || !project || !taskToDelete) return;
    const taskRef = doc(firestore, `projects/${project.id}/tasks`, taskToDelete.id);
    try {
      await deleteDoc(taskRef);
      toast({
        title: 'Task Deleted',
        description: `The task "${taskToDelete.title}" has been removed.`,
      });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete the task.' });
    } finally {
      setIsAlertOpen(false);
      setTaskToDelete(null);
    }
  };

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
  
  const columns: ('To Do' | 'In Progress' | 'Done')[] = ['To Do', 'In Progress', 'Done'];

  if (projectLoading) {
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
    <DndProvider backend={HTML5Backend}>
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

            <Card>
                <CardHeader className='flex-row items-center justify-between'>
                    <div>
                        <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary"/> Project Tasks</CardTitle>
                        <CardDescription>A Kanban board for tasks specific to this project.</CardDescription>
                    </div>
                     <Dialog open={isTaskFormOpen} onOpenChange={(isOpen) => {
                        setTaskFormOpen(isOpen);
                        if (!isOpen) setTaskToEdit(null);
                    }}>
                        <DialogTrigger asChild>
                            <Button size="sm"><PlusCircle className='mr-2 h-4 w-4' />Create Task</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{taskToEdit ? 'Edit Task' : 'Create Project Task'}</DialogTitle>
                                <DialogDescription>{taskToEdit ? 'Update task details.' : `Assign a new task for the "${project.projectName}" project.`}</DialogDescription>
                            </DialogHeader>
                            <ProjectTaskForm 
                                projectId={project.id} 
                                task={taskToEdit}
                                onTaskCreated={() => {
                                    setTaskFormOpen(false);
                                    setTaskToEdit(null);
                                }} 
                            />
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {tasksLoading ? (
                        <div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>
                    ) : (
                        <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6">
                        {columns.map(status => (
                            <div key={status} className="min-w-[280px] flex-1">
                            <TaskColumn
                                status={status}
                                tasks={projectTasks?.filter(task => task.status === status) || []}
                                onTaskDrop={handleTaskDrop}
                                onTaskDelete={openDeleteDialog}
                                onTaskEdit={(task) => openEditDialog(task as ProjectTask)}
                            />
                            </div>
                        ))}
                        </div>
                    )}
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
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Team Members</CardTitle>
                    <CardDescription>Manage who is on this project team.</CardDescription>
                </CardHeader>
                <CardContent>
                    {usersLoading ? <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
                        <ScrollArea className="h-96">
                            <div className="space-y-2">
                                {allUsers?.map(user => {
                                    const isMember = project.team.includes(user.id);
                                    return (
                                        <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={user.profilePictureUrl} />
                                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button 
                                                size="icon" 
                                                variant={isMember ? "destructive" : "outline"} 
                                                className="h-8 w-8"
                                                onClick={() => handleToggleTeamMember(user.id)}
                                            >
                                                {isMember ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>

    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-destructive" />
            Are you sure you want to delete this task?
            </AlertDialogTitle>
            <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the task
            titled: <span className="font-semibold text-foreground">"{taskToDelete?.title}"</span>.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </DndProvider>
  );
}
