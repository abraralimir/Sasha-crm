'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, Bot, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type VerificationStep = 'start' | 'email' | 'code' | 'denied' | 'success';

const allowedUsers: Record<string, string> = {
  'alimirabrar@gmail.com': '0012',
  'saleem@bitstek.io': '0776',
  'adil@bitstek.io': '0779',
};

export default function VerifyPage() {
  const [step, setStep] = useState<VerificationStep>('start');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sessionStorage.removeItem('isVerified');
    // Animate to email step after initial greeting
    const timer = setTimeout(() => setStep('email'), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ((step === 'email' || step === 'code') && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage('');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    if (step === 'email') {
      const email = input.trim().toLowerCase();
      if (allowedUsers[email]) {
        setCurrentUserEmail(email);
        setStep('code');
        setInput('');
      } else {
        setErrorMessage('This email is not authorized.');
        setStep('denied');
        setTimeout(() => {
            setInput('')
            setStep('email');
        }, 2000)
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
      } else {
        setErrorMessage('Invalid secret code. Please try again.');
        setInput('');
      }
    }

    setIsLoading(false);
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
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <CardHeader className="text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <Bot className="mx-auto h-12 w-12 text-primary" />
        </motion.div>
        <CardTitle className="text-2xl font-headline tracking-tight">Sasha AI Verification</CardTitle>
        <CardDescription>Please verify your access to proceed.</CardDescription>
      </CardHeader>
      <CardContent className="h-40">
        <form onSubmit={handleSubmit} className="h-full">
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
            
            {(step === 'email' || step === 'denied') && (
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

            {step === 'code' && (
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
  );
}
