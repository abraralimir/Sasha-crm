'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Bot, KeyRound, Info, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';


type VerificationStep = 'start' | 'email' | 'code' | 'denied' | 'success';

const allowedUsers: Record<string, string> = {
  'alimirabrar@gmail.com': '0012',
  'saleem@bitstek.io': '0776',
  'adil@bitstek.io': '0779',
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000; // 30 seconds
const ATTEMPT_WINDOW_MS = 60000; // 1 minute

export default function VerifyPage() {
  const [step, setStep] = useState<VerificationStep>('start');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Rate limiting state
  const [attemptTimestamps, setAttemptTimestamps] = useState<number[]>([]);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    sessionStorage.removeItem('isVerified');
    const timer = setTimeout(() => setStep('email'), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ((step === 'email' || step === 'code') && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLockedOut) {
      setLockoutTimeLeft(LOCKOUT_DURATION_MS / 1000);
      interval = setInterval(() => {
        setLockoutTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsLockedOut(false);
            setAttemptTimestamps([]); // Reset attempts after lockout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLockedOut]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (errorMessage) setErrorMessage('');
  };
  
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

  const handleVerification = async () => {
    if (!input.trim() || isLoading || isLockedOut) return;

    setIsLoading(true);
    setErrorMessage('');

    await new Promise(resolve => setTimeout(resolve, 600));

    let success = false;
    if (step === 'email') {
      const email = input.trim().toLowerCase();
      if (allowedUsers[email]) {
        setCurrentUserEmail(email);
        setStep('code');
        setInput('');
        setAttemptTimestamps([]); // Reset attempts on successful email
        success = true;
      } else {
        setErrorMessage('This email is not authorized.');
        setStep('denied');
        setTimeout(() => {
            setInput('')
            setStep('email');
        }, 2000);
      }
    } else if (step === 'code' && currentUserEmail) {
      if (input.trim() === allowedUsers[currentUserEmail]) {
        setStep('success');
        sessionStorage.setItem('isVerified', 'true');
        toast({
          title: 'Verification Successful!',
          description: 'Redirecting to sign-up...',
        });
        setTimeout(() => router.push('/signup'), 1500);
        success = true;
      } else {
        setErrorMessage('Invalid secret code. Please try again.');
        setInput('');
      }
    }
    
    if (!success) {
      handleFailedAttempt();
    }
    
    setIsLoading(false);
  };


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleVerification();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <>
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <Bot className="mx-auto h-12 w-12 text-primary" />
        </motion.div>
        <CardTitle className="text-2xl font-headline tracking-tight">Sasha AI Verification</CardTitle>
        <CardDescription>Please verify your access to proceed.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[16rem] flex flex-col justify-center">
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {step === 'start' && (
              <motion.div
                key="start"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="text-center text-muted-foreground"
              >
                <p>Initializing secure connection...</p>
              </motion.div>
            )}
            
            {(step === 'email' || step === 'denied') && !isLockedOut && (
              <motion.div key="email" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="space-y-4">
                <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Enter your email address</label>
                <div className="relative">
                  <Input
                    ref={inputRef}
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={input}
                    onChange={handleInputChange}
                    disabled={isLoading || step === 'denied'}
                    className={cn("pr-10", errorMessage && 'border-destructive')}
                  />
                   <Button type="submit" size="icon" className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full' disabled={isLoading || !input.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>
                {step === 'denied' && errorMessage && <p className="text-sm text-destructive text-center">{errorMessage}</p>}
              </motion.div>
            )}

            {step === 'code' && !isLockedOut && (
              <motion.div key="code" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.4 }} className="space-y-4">
                 <label htmlFor="code" className="block text-sm font-medium text-muted-foreground">Enter your secret code</label>
                 <div className="relative">
                    <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        id="code"
                        type="password"
                        placeholder="••••"
                        value={input}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={cn("pl-8 pr-10", errorMessage && 'border-destructive')}
                    />
                    <Button type="submit" size="icon" className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full' disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    </Button>
                 </div>
                 {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
              </motion.div>
            )}

            {isLockedOut && (
                 <motion.div key="lockout" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center h-full gap-2 text-center text-destructive">
                    <ShieldAlert className="h-8 w-8" />
                    <p className='font-bold'>Too Many Failed Attempts</p>
                    <p className='text-sm text-muted-foreground'>Please try again in {lockoutTimeLeft} seconds.</p>
                 </motion.div>
            )}

            {step === 'success' && (
                 <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="flex flex-col items-center justify-center h-full gap-2 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className='text-muted-foreground'>Verification complete. Redirecting...</p>
                 </motion.div>
            )}
          </AnimatePresence>
        </form>
      </CardContent>
    </Card>
    <div className="mt-6 text-center">
        <Link href="/about" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Info className="h-4 w-4"/>
            Learn more about SashaLeads AI
        </Link>
    </div>
    </>
  );
}
