
'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { useRef } from 'react';

const formSchema = z.object({
  title: z.string().min(3, 'Policy title is required.'),
  category: z.string().min(2, 'Category is required.'),
  version: z.string().min(1, 'Version number is required.'),
  file: z.instanceof(File).refine(file => file.size > 0, 'A file must be selected.'),
});

type PolicyUploadFormProps = {
  onFinished?: () => void;
};

export function PolicyUploadForm({ onFinished }: PolicyUploadFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: '',
      version: '1.0',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;

    // Placeholder for actual file upload logic to Firebase Storage
    // In a real app, you would upload the file here and get a download URL.
    const fileUrl = `https://storage.placeholder.com/${values.file.name}`;

    const payload = {
      title: values.title,
      category: values.category,
      version: values.version,
      fileName: values.file.name,
      fileUrl: fileUrl, // Use the real URL from storage
      createdAt: serverTimestamp(),
    };

    try {
      const policiesCollection = collection(firestore, 'policyDocuments');
      await addDocumentNonBlocking(policiesCollection, payload);
      toast({
        title: 'Policy Uploaded',
        description: `The document "${values.title}" has been added.`,
      });
      form.reset();
      onFinished?.();
    } catch (error) {
      console.error('Error uploading policy:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to upload the policy document.',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Title</FormLabel>
              <FormControl><Input placeholder="e.g., Employee Handbook" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl><Input placeholder="e.g., Human Resources" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="version"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Version</FormLabel>
              <FormControl><Input placeholder="1.0" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                <FormLabel>Policy Document</FormLabel>
                <FormControl>
                    <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
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
          Upload Document
        </Button>
      </form>
    </Form>
  );
}

    