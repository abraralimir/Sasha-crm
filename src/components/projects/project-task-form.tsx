'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, serverTimestamp, addDoc, setDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { UserProfile, ProjectTask } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';

const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  assigneeId: z.string().min(1, 'Please select an assignee.'),
  status: z.enum(['To Do', 'In Progress', 'Done']),
});

type ProjectTaskFormProps = {
  projectId: string;
  task?: ProjectTask | null;
  onTaskCreated?: () => void;
}

export function ProjectTaskForm({ projectId, task, onTaskCreated }: ProjectTaskFormProps) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersCollection);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'To Do',
      assigneeId: '',
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description,
        status: task.status,
        assigneeId: task.assigneeId,
      });
    } else {
        form.reset({
            title: '',
            description: '',
            status: 'To Do',
            assigneeId: '',
        });
    }
  }, [task, form]);

  const onSubmit = async (values: z.infer<typeof taskFormSchema>) => {
    if (!firestore || !currentUser || !projectId) return;
    const selectedUser = users?.find((u) => u.id === values.assigneeId);

    if (!selectedUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find the selected user.' });
        return;
    }
    
    const taskPayload = {
      title: values.title,
      description: values.description,
      status: values.status,
      assigneeId: values.assigneeId,
      assigneeName: selectedUser.name || '',
      assigneeAvatar: selectedUser.profilePictureUrl || '',
      createdAt: task ? task.createdAt : serverTimestamp(),
    };
    
    const projectTasksCollection = collection(firestore, 'projects', projectId, 'tasks');

    try {
        if (task) {
            const taskRef = doc(projectTasksCollection, task.id);
            await setDoc(taskRef, taskPayload, { merge: true });
            toast({
                title: 'Project Task Updated',
                description: `Task "${values.title}" has been updated.`,
            });
        } else {
            await addDoc(projectTasksCollection, taskPayload);
            toast({
                title: 'Project Task Created',
                description: `Task "${values.title}" has been assigned.`,
            });

             // Notify the assigned user if it's not the current user
            if (currentUser.uid !== selectedUser.id) {
                const notificationPayload = {
                    title: 'New Project Task',
                    message: `You were assigned: "${values.title}".`,
                    link: '/project-tasks',
                    read: false,
                    createdAt: serverTimestamp(),
                };
                const notificationRef = collection(firestore, 'users', selectedUser.id, 'notifications');
                addDoc(notificationRef, notificationPayload);
            }
        }
        onTaskCreated?.();

    } catch (error) {
        console.error('Error creating project task:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create project task.',
        });
    }
  };
  
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Design the homepage mockup" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Add a short description of the task..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="assigneeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign To</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={usersLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={usersLoading ? 'Loading users...' : 'Select a team member'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            task ? 'Save Changes' : 'Create Task'
          )}
        </Button>
      </form>
    </Form>
  );

  return (
    <ScrollArea className="max-h-[70vh]">
        <div className="pr-6">
            {formContent}
        </div>
    </ScrollArea>
  )
}
