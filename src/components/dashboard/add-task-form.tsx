
'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { useEffect } from 'react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  assigneeId: z.string().min(1, 'Please select an assignee.'),
  status: z.enum(['To Do', 'In Progress', 'Done']),
});

type AddTaskFormProps = {
  defaultTitle?: string;
  onTaskCreated?: () => void;
}

export function AddTaskForm({ defaultTitle, onTaskCreated }: AddTaskFormProps) {
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
    },
  });

  useEffect(() => {
    if (defaultTitle) {
      form.setValue('title', defaultTitle);
    }
  }, [defaultTitle, form]);

  const onSubmit = async (values: z.infer<typeof taskFormSchema>) => {
    if (!firestore || !currentUser) return;
    const selectedUser = users?.find((u) => u.id === values.assigneeId);

    if (!selectedUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not find the selected user.' });
        return;
    }
    
    form.control.disabled = true;

    const taskPayload = {
      title: values.title,
      description: values.description,
      status: values.status,
      assigneeId: values.assigneeId,
      assigneeName: selectedUser.name || '',
      assigneeAvatar: selectedUser.profilePictureUrl || '',
      createdAt: serverTimestamp(),
    };

    const tasksCollection = collection(firestore, 'tasks');
    addDocumentNonBlocking(tasksCollection, taskPayload)
      .then(() => {
        toast({
          title: 'Task Created',
          description: `Task "${values.title}" has been assigned.`,
        });

        // Create a notification for the assigned user, unless they are assigning it to themselves
        if (currentUser.uid !== selectedUser.id) {
          const notificationPayload = {
            title: 'New Task Assigned',
            message: `You were assigned: "${values.title}" by ${currentUser.displayName}.`,
            link: '/tickets',
            read: false,
            createdAt: serverTimestamp(),
          };
          const notificationRef = collection(firestore, 'users', selectedUser.id, 'notifications');
          addDocumentNonBlocking(notificationRef, notificationPayload);
        }

        form.reset();
        onTaskCreated?.();
      })
      .catch((error) => {
        console.error('Error creating task:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create task.',
        });
      })
      .finally(() => {
        form.control.disabled = false;
      });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Ticket</CardTitle>
        <CardDescription>Assign a new task to a team member.</CardDescription>
      </CardHeader>
      <CardContent>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={usersLoading}>
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
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                'Create Ticket'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
