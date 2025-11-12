
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, KeyRound, Info, ShieldAlert, Camera, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { LogoIcon } from '@/components/logo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';


// --- Existing User Data (with new facialVerificationImageUrl) ---
const allowedUsers: Record<string, { code: string; }> = {
  'alimirabrar@gmail.com': { code: '0012' },
  'saleem@bitstek.io': { code: '0776' },
  'adil@bitstek.io': { code: '0779' },
  'ismail@sbm.com': { code: '0071' },
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000;
const ATTEMPT_WINDOW_MS = 60000;

export default function VerifyPage() {
  const [step, setStep] = useState<'start' | 'verification' | 'code' | 'denied' | 'success'>('start');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Rate limiting
  const [attemptTimestamps, setAttemptTimestamps] = useState<number[]>([]);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    sessionStorage.removeItem('isVerified');
    sessionStorage.removeItem('verifiedEmail');
    const timer = setTimeout(() => setStep('verification'), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLockedOut) {
      setLockoutTimeLeft(LOCKOUT_DURATION_MS / 1000);
      interval = setInterval(() => {
        setLockoutTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsLockedOut(false);
            setAttemptTimestamps([]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLockedOut]);

  const handleFailedAttempt = () => {
    const now = Date.now();
    const recentAttempts = [...attemptTimestamps, now].filter(
      timestamp => now - timestamp < ATTEMPT_WINDOW_MS
    );
    setAttemptTimestamps(recentAttempts);
    if (recentAttempts.length >= MAX_ATTEMPTS) {
      setIsLockedOut(true);
      setErrorMessage(`Too many failed attempts. Please wait ${LOCKOUT_DURATION_MS / 1000} seconds.`);
    }
  };

  const handleKeyVerification = async () => {
    if (!input.trim() || isLoading || isLockedOut) return;
    setIsLoading(true);
    setErrorMessage('');
    await new Promise(resolve => setTimeout(resolve, 600));

    const email = input.trim().toLowerCase();
    if (allowedUsers[email]) {
      setCurrentUserEmail(email);
      setStep('code');
      setInput('');
      setAttemptTimestamps([]);
    } else {
      setErrorMessage('This email is not authorized.');
      setStep('denied');
      handleFailedAttempt();
      setTimeout(() => {
          setInput('');
          setStep('verification');
          setErrorMessage('');
      }, 2000);
    }
    setIsLoading(false);
  };
  
  const handleCodeVerification = async () => {
    if (!input.trim() || !currentUserEmail || isLoading || isLockedOut) return;
    setIsLoading(true);
    setErrorMessage('');
    await new Promise(resolve => setTimeout(resolve, 600));

    if (input.trim() === allowedUsers[currentUserEmail].code) {
        setStep('success');
        sessionStorage.setItem('isVerified', 'true');
        sessionStorage.setItem('verifiedEmail', currentUserEmail);
        toast({ title: 'Verification Successful!', description: 'Redirecting to sign-up...' });
        setTimeout(() => router.push('/signup'), 1500);
    } else {
        setErrorMessage('Invalid secret code. Please try again.');
        setInput('');
        handleFailedAttempt();
    }
    setIsLoading(false);
  }

  const handleFacialVerification = async () => {
      toast({
          variant: "destructive",
          title: "AI Feature Unavailable",
          description: "This feature has been temporarily disabled."
      })
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <>
      <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <LogoIcon className="mx-auto h-12 w-12 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl font-headline tracking-tight">Sasha AI Verification</CardTitle>
          <CardDescription>Please verify your access to proceed.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[22rem] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 'start' && (
              <motion.div key="start" variants={containerVariants} initial="hidden" animate="visible" exit="hidden" className="text-center text-muted-foreground">
                <p>Initializing secure connection...</p>
              </motion.div>
            )}

            {(step === 'verification' || step === 'code' || step === 'denied') && (
              <motion.div key="verification-options" variants={containerVariants} initial="hidden" animate="visible" exit="hidden">
                {isLockedOut ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-center text-destructive">
                    <ShieldAlert className="h-8 w-8" />
                    <p className='font-bold'>Too Many Failed Attempts</p>
                    <p className='text-sm text-muted-foreground'>Please try again in {lockoutTimeLeft} seconds.</p>
                  </div>
                ) : (
                  <Tabs defaultValue="key" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="key"><KeyRound className="mr-2 h-4 w-4" />Secret Key</TabsTrigger>
                      <TabsTrigger value="face"><Camera className="mr-2 h-4 w-4" />Face</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="key" className="pt-4">
                      {step === 'verification' || step === 'denied' ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleKeyVerification(); }} className="space-y-4">
                          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Enter your email address</label>
                          <div className="relative">
                            <Input id="email" type="email" placeholder="name@example.com" value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading || step === 'denied'} className={cn(errorMessage && 'border-destructive')} />
                            <Button type="submit" size="icon" className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full' disabled={isLoading || !input.trim()}>
                              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                            </Button>
                          </div>
                          {(step === 'denied' || (step === 'verification' && errorMessage)) && <p className="text-sm text-destructive text-center">{errorMessage}</p>}
                        </form>
                      ) : step === 'code' && (
                         <form onSubmit={(e) => { e.preventDefault(); handleCodeVerification(); }} className="space-y-4">
                            <label htmlFor="code" className="block text-sm font-medium text-muted-foreground">Enter your secret code</label>
                            <div className="relative">
                               <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               <Input id="code" type="password" placeholder="••••" value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} className={cn("pl-8 pr-10", errorMessage && 'border-destructive')} />
                               <Button type="submit" size="icon" className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full' disabled={isLoading || !input.trim()}>
                                   {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                               </Button>
                            </div>
                            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
                         </form>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="face" className="pt-4">
                       <div className="space-y-4">
                         <div className="aspect-video w-full bg-secondary rounded-md overflow-hidden relative flex items-center justify-center">
                            <Camera className="h-12 w-12 text-muted-foreground" />
                         </div>
                         <Button onClick={handleFacialVerification} className="w-full" disabled={true}>
                           <UserCheck className="mr-2 h-4 w-4" />
                           Verify My Identity (Disabled)
                         </Button>
                       </div>
                    </TabsContent>
                  </Tabs>
                )}
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full gap-2 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className='text-muted-foreground'>Verification complete. Redirecting...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
        <Link href="/about" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Info className="h-4 w-4" />
          Learn more about SashaLeads AI
        </Link>
      </div>
    </>
  );
}
