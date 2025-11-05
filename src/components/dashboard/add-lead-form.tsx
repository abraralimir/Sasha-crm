
'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const leadFormSchema = z.object({
  contactName: z.string().min(2, 'Contact name is required.'),
  companyName: z.string().min(2, 'Company name is required.'),
  email: z.string().email('Please enter a valid email.'),
  status: z.enum(['New', 'Contacted', 'Proposal', 'Closed', 'Lost']),
  potentialRevenue: z.coerce.number().positive('Must be a positive number.').optional(),
});

export function AddLeadForm() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof leadFormSchema>>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      contactName: '',
      companyName: '',
      email: '',
      status: 'New',
    },
  });

  const onSubmit = async (values: z.infer<typeof leadFormSchema>) => {
    if (!firestore) return;

    try {
      const leadsCollection = collection(firestore, 'leads');
      await addDoc(leadsCollection, {
        ...values,
        lastContacted: serverTimestamp(),
      });

      toast({
        title: 'Lead Generated',
        description: `Lead for ${values.contactName} has been added.`,
      });
      form.reset();
    } catch (error) {
      console.error('Error creating lead:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate lead.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate a Lead</CardTitle>
        <CardDescription>Enter details to create a new lead.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Innovate Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@innovate.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="potentialRevenue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potential Revenue ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5000" {...field} />
                  </FormControl>
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
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Proposal">Proposal</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
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
                'Generate Lead'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
