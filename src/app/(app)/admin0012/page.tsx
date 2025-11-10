'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, UserPlus } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  image: z.instanceof(File).refine(file => file.size > 0, 'A reference image is required.'),
});

const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const usersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersCollection);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;

    const usersQuery = query(collection(firestore, 'users'), where('email', '==', values.email));
    
    try {
      const querySnapshot = await getDocs(usersQuery);
      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'User Not Found', description: 'No user exists with this email address.' });
        return;
      }
      
      const userDoc = querySnapshot.docs[0];

      // Placeholder for actual file upload to Firebase Storage
      const fileUrl = `https://storage.placeholder.com/faces/${userDoc.id}/${values.image.name}`;

      await updateDoc(doc(firestore, 'users', userDoc.id), { 
        name: values.name,
        facialVerificationImageUrl: fileUrl,
       });

      toast({
        title: 'User Updated',
        description: `Facial verification image has been set for ${values.name}.`,
      });
      form.reset();

    } catch (error) {
      console.error('Error updating user for facial verification:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update user profile for facial recognition.',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Manage user settings and platform configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserPlus /> Enroll User for Facial Recognition</CardTitle>
            <CardDescription>Upload a reference photo for a user to enable facial verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Email</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange, value, ...rest } }) => (
                        <FormItem>
                        <FormLabel>Reference Photo</FormLabel>
                        <FormControl>
                            <Input
                            type="file"
                            accept="image/jpeg, image/png"
                            onChange={(e) => onChange(e.target.files?.[0])}
                            {...rest}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Set Reference Image
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Enrolled Users</CardTitle>
            <CardDescription>Users with facial recognition enabled.</CardDescription>
          </CardHeader>
          <CardContent>
             {usersLoading ? (
                <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div>
             ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {users?.filter(u => u.facialVerificationImageUrl).map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                            <div className='flex items-center gap-3'>
                                <Avatar>
                                    <AvatarImage src={user.facialVerificationImageUrl} />
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
