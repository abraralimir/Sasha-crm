
'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';

const createGroupSchema = z.object({
  name: z.string().min(3, 'Group name must be at least 3 characters.'),
  members: z.array(z.string()).min(1, 'You must select at least one member.'),
});

type CreateGroupFormProps = {
  onFinished?: () => void;
};

export function CreateGroupForm({ onFinished }: CreateGroupFormProps) {
  const { user: currentUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersCollection);

  const form = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      members: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof createGroupSchema>) => {
    if (!firestore || !currentUser) return;
    
    // Ensure the current user is always a member
    const finalMembers = Array.from(new Set([...values.members, currentUser.uid]));

    const payload = {
      name: values.name,
      members: finalMembers,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
    };

    const groupsCollection = collection(firestore, 'groups');
    addDocumentNonBlocking(groupsCollection, payload)
      .then(() => {
        toast({
          title: 'Group Created',
          description: `Group "${values.name}" has been successfully created.`,
        });
        form.reset();
        onFinished?.();
      })
      .catch((error) => {
        console.error('Error creating group:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to create the group.',
        });
      });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Marketing Team" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="members"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Select Members</FormLabel>
              </div>
              <ScrollArea className="h-48 w-full rounded-md border">
                <div className="p-4 space-y-2">
                  {usersLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : (
                    users?.filter(u => u.id !== currentUser?.uid).map((user) => (
                      <FormField
                        key={user.id}
                        control={form.control}
                        name="members"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(user.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, user.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== user.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal w-full cursor-pointer">
                              {user.name}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Create Group'
          )}
        </Button>
      </form>
    </Form>
  );
}
