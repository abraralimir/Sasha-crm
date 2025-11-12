
'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Loader2, Upload, UserPlus, Camera, RefreshCcw, UserCheck } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';


const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  imageFile: z.instanceof(File).optional(),
});

const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export default function AdminPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const usersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersCollection);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

   useEffect(() => {
    if (hasCameraPermission && videoRef.current) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Error accessing camera stream:", err);
                setHasCameraPermission(false);
                toast({ variant: "destructive", title: "Camera Error" });
            });
    }
  }, [hasCameraPermission, toast]);

  const getCameraPermission = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
          setHasCameraPermission(false);
          toast({ variant: 'destructive', title: 'Camera not supported' });
          return;
      }
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
      } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({ variant: 'destructive', title: 'Camera Access Denied' });
      }
  };

  const handleTabChange = (value: string) => {
    if (value === 'capture' && hasCameraPermission === null) {
      getCameraPermission();
    } else if (value === 'upload' && videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);

    // Stop the camera stream
    const stream = video.srcObject as MediaStream;
    stream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  };

  const handleRetake = () => {
    setCapturedImage(null);
    getCameraPermission(); // Re-request permission and stream
  };


  const onSubmit = async (values: z.infer<typeof formSchema>, imageSource: 'upload' | 'capture') => {
    if (!firestore) return;

    let imageUrl = '';
    let imageName = '';

    // Simulate file upload and get a URL. In a real app, this would use Firebase Storage.
    if (imageSource === 'upload') {
      const file = values.imageFile;
      if (!file) {
        toast({ variant: 'destructive', title: 'No Image', description: 'Please select an image file to upload.' });
        return;
      }
      imageName = file.name;
      imageUrl = URL.createObjectURL(file); // Placeholder URL for display
    } else if (imageSource === 'capture') {
      if (!capturedImage) {
        toast({ variant: 'destructive', title: 'No Image', description: 'Please capture an image from the webcam.' });
        return;
      }
      imageName = `capture-${Date.now()}.jpg`;
      imageUrl = capturedImage;
    }

    const usersQuery = query(collection(firestore, 'users'), where('email', '==', values.email));
    
    try {
      const querySnapshot = await getDocs(usersQuery);
      if (querySnapshot.empty) {
        toast({ variant: 'destructive', title: 'User Not Found', description: 'No user exists with this email address.' });
        return;
      }
      
      const userDoc = querySnapshot.docs[0];

      await updateDoc(doc(firestore, 'users', userDoc.id), { 
        name: values.name,
        facialVerificationImageUrl: imageUrl,
       });

      toast({
        title: 'User Updated',
        description: `Facial verification image has been set for ${values.name}.`,
      });
      form.reset();
      setCapturedImage(null);

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
            <CardDescription>Upload or capture a reference photo for a user to enable facial verification.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-4">
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
                 <Tabs defaultValue="upload" className="w-full" onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="capture">Capture</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="pt-4">
                        <FormField
                            control={form.control}
                            name="imageFile"
                            render={({ field: { onChange, value, ...rest } }) => (
                                <FormItem>
                                <FormLabel>Reference Photo File</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/jpeg, image/png" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button onClick={form.handleSubmit((v) => onSubmit(v, 'upload'))} className="w-full mt-4" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                          Set via Upload
                        </Button>
                    </TabsContent>
                    <TabsContent value="capture" className="pt-4 space-y-4">
                        <div className="aspect-video w-full bg-secondary rounded-md overflow-hidden relative flex items-center justify-center">
                            {!capturedImage && (
                                <video ref={videoRef} className={cn("w-full h-full object-cover", { 'hidden': !hasCameraPermission })} autoPlay playsInline muted />
                            )}
                            <canvas ref={canvasRef} className="hidden"></canvas>
                            {hasCameraPermission === false && <p className="text-destructive-foreground">Camera access denied.</p>}
                            {hasCameraPermission === null && !capturedImage && <Loader2 className="h-8 w-8 animate-spin" />}
                            {capturedImage && <img src={capturedImage} alt="Captured reference" className="w-full h-full object-cover" />}
                        </div>

                        {capturedImage ? (
                          <div className='flex gap-2'>
                              <Button onClick={handleRetake} variant="outline" className="w-full">
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Retake
                              </Button>
                              <Button onClick={form.handleSubmit((v) => onSubmit(v, 'capture'))} className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                Set via Capture
                              </Button>
                          </div>
                        ) : (
                          <Button onClick={handleCapture} className="w-full" disabled={!hasCameraPermission}>
                            <Camera className="mr-2 h-4 w-4" />
                            Capture Photo
                          </Button>
                        )}
                    </TabsContent>
                </Tabs>
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
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                                  <Avatar className="h-10 w-10">
                                      <AvatarImage src={user.facialVerificationImageUrl} />
                                      <AvatarFallback><UserCheck className="h-5 w-5 text-primary" /></AvatarFallback>
                                  </Avatar>
                                </div>
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
