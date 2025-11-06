'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/logo';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type VerificationStep = 'awaitingEmail' | 'awaitingCode';

const allowedUsers: Record<string, string> = {
    'alimirabrar@gmail.com': '0012',
    'saleem@bitstek.io': '0776',
    'adil@bitstek.io': '0779',
};


export default function VerifyPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Hello! I am Sasha, your AI assistant. To get started, please provide your email address.' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<VerificationStep>('awaitingEmail');
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.removeItem('isVerified');
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    addMessage('user', userMessage);
    setInput('');
    setIsLoading(true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 500));

    if (step === 'awaitingEmail') {
        const email = userMessage.trim().toLowerCase();
        if (allowedUsers[email]) {
            addMessage('assistant', 'Thank you. Now, please enter the secret code to proceed.');
            setCurrentUserEmail(email);
            setStep('awaitingCode');
        } else {
            addMessage('assistant', 'You are not a member of Sasha Leads.');
            setIsAccessDenied(true);
        }
    } else if (step === 'awaitingCode' && currentUserEmail) {
        if (userMessage.trim() === allowedUsers[currentUserEmail]) {
            addMessage('assistant', 'Verification successful! Congratulations. You will now be redirected to the sign-up page.');
            toast({
                title: 'Verification Successful!',
                description: 'Redirecting you to the sign-up page...',
            });
            sessionStorage.setItem('isVerified', 'true');
            setTimeout(() => router.push('/signup'), 2000);
        } else {
            addMessage('assistant', 'The secret code is incorrect. Please try again.');
        }
    }

    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-lg border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline tracking-tight">Account Verification</CardTitle>
        <CardDescription>Please verify your access with Sasha AI to proceed.</CardDescription>
      </CardHeader>
      <CardContent className="h-[30rem] flex flex-col">
        <ScrollArea className="h-full flex-1" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                 {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/20 text-primary">
                        <LogoIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 max-w-[80%] whitespace-pre-wrap shadow-sm',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
               <div className='flex items-start gap-3 justify-start'>
                  <Avatar className="h-8 w-8 border-2 border-primary/50">
                     <AvatarFallback className="bg-primary/20 text-primary">
                        <LogoIcon className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className='rounded-lg px-3 py-2 max-w-[80%] bg-secondary flex items-center shadow-sm'>
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="w-full">
            <div className='relative flex items-center'>
                <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    disabled={isLoading || isAccessDenied}
                    rows={1}
                    className='min-h-0 resize-none pr-12'
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e as any);
                        }
                    }}
                />
                <Button type="submit" size="icon" className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full' disabled={isLoading || !input.trim() || isAccessDenied}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
      </CardFooter>
    </Card>
  );
}
