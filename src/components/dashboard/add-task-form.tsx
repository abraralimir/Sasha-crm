'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, serverTimestamp, addDoc, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { UserProfile, Task } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';

const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  assigneeId: z.string().min(1, 'Please select an assignee.'),
  status: z.enum(['To Do', 'In Progress', 'Done']),
});

type AddTaskFormProps = {
  task?: Task | null;
  defaultTitle?: string;
  onTaskCreated?: () => void;
}

export function AddTaskForm({ task, defaultTitle, onTaskCreated }: AddTaskFormProps) {
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
      title: defaultTitle || '',
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
    } else if (defaultTitle) {
      form.setValue('title', defaultTitle);
    } else {
        form.reset({
            title: '',
            description: '',
            status: 'To Do',
            assigneeId: '',
        });
    }
  }, [task, defaultTitle, form]);

  const onSubmit = async (values: z.infer<typeof taskFormSchema>) => {
    if (!firestore || !currentUser) return;
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
      createdAt: task ? task.createdAt : serverTimestamp(), // Preserve original creation date on edit
    };

    try {
        if (task) {
            const taskRef = doc(firestore, 'tasks', task.id);
            await setDoc(taskRef, taskPayload, { merge: true });
            toast({
                title: 'Task Updated',
                description: `Task "${values.title}" has been updated.`,
            });
        } else {
            const tasksCollection = collection(firestore, 'tasks');
            const newDocRef = await addDoc(tasksCollection, taskPayload);
            toast({
                title: 'Task Created',
                description: `Task "${values.title}" has been assigned.`,
            });

            // Send notification only on creation and if assignee is not current user
            if (currentUser.uid !== selectedUser.id) {
                const notificationPayload = {
                    title: 'New Task Assigned',
                    message: `You were assigned: "${values.title}" by ${currentUser.displayName}.`,
                    link: '/tickets',
                    read: false,
                    createdAt: serverTimestamp(),
                };
                const notificationRef = collection(firestore, 'users', selectedUser.id, 'notifications');
                addDoc(notificationRef, notificationPayload);
            }
        }
        
        onTaskCreated?.();

    } catch (error) {
        console.error('Error saving task:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to save task.',
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
                <Input placeholder="E.g., Follow up with Innovate Inc." {...field} />
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
                <Textarea placeholder="Add a short description..." {...field} />
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
                    <SelectValue placeholder={usersLoading ? 'Loading users...' : 'Select a user'} />
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
            task ? 'Save Changes' : 'Create Ticket'
          )}
        </Button>
      </form>
    </Form>
  );

  // If onTaskCreated is provided, it's in a dialog, so don't render the Card
  if (onTaskCreated) {
    return (
        <ScrollArea className="max-h-[70vh]">
            <div className="pr-6">
                {formContent}
            </div>
        </ScrollArea>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Ticket</CardTitle>
        <CardDescription>Assign a new task to a team member.</CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}
