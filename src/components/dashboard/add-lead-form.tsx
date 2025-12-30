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
import { collection, serverTimestamp, addDoc, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Lead } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { useEffect } from 'react';

type LeadWithId = Lead & { id: string; lastContacted: Timestamp };

const leadFormSchema = z.object({
  contactName: z.string().min(2, 'Contact name is required.'),
  companyName: z.string().min(2, 'Company name is required.'),
  email: z.string().email('Please enter a valid email.'),
  status: z.enum(['New', 'Contacted', 'Proposal', 'Closed', 'Lost']),
  potentialRevenue: z.coerce.number().positive('Must be a positive number.').optional(),
});

type AddLeadFormProps = {
  lead?: LeadWithId | null;
  onFinished?: () => void;
};

export function AddLeadForm({ lead, onFinished }: AddLeadFormProps) {
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

  useEffect(() => {
    if (lead) {
      form.reset({
        contactName: lead.contactName,
        companyName: lead.companyName,
        email: lead.email,
        status: lead.status,
        potentialRevenue: lead.potentialRevenue,
      });
    } else {
      form.reset({
        contactName: '',
        companyName: '',
        email: '',
        status: 'New',
        potentialRevenue: undefined,
      });
    }
  }, [lead, form]);

  const onSubmit = async (values: z.infer<typeof leadFormSchema>) => {
    if (!firestore) return;

    try {
      if (lead) {
        const leadRef = doc(firestore, 'leads', lead.id);
        await setDoc(leadRef, {
            ...values,
            lastContacted: serverTimestamp(),
        }, { merge: true });
        toast({
          title: 'Lead Updated',
          description: `Lead for ${values.contactName} has been updated.`,
        });
      } else {
        const leadsCollection = collection(firestore, 'leads');
        await addDoc(leadsCollection, {
          ...values,
          lastContacted: serverTimestamp(),
        });
        toast({
          title: 'Lead Generated',
          description: `Lead for ${values.contactName} has been added.`,
        });
      }
      form.reset();
      onFinished?.();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save lead.',
      });
    }
  };

  const formContent = (
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
                <Input type="number" placeholder="5000" {...field} value={field.value ?? ''} />
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
              <Select onValueChange={field.onChange} value={field.value}>
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
            lead ? 'Save Changes' : 'Generate Lead'
          )}
        </Button>
      </form>
    </Form>
  );

  // If onFinished is provided, it's in a dialog, so don't render the Card
  if (onFinished) {
    return formContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate a Lead</CardTitle>
        <CardDescription>Enter details to create a new lead.</CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}
