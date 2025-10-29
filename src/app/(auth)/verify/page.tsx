'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Loader2, Send } from 'lucide-react';
import { verifySignupAccess } from '@/ai/flows/verify-signup-access';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function VerifyPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: 'Hello! I am Sasha, your AI assistant. To get started, please provide your email address.' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Clear any previous verification status when the page loads
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await verifySignupAccess({ userMessage: input });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);

      if (result.isVerified) {
        toast({
          title: 'Verification Successful!',
          description: 'Redirecting you to the sign-up page...',
        });
        // Set a flag to indicate verification is complete for this session
        sessionStorage.setItem('isVerified', 'true');
        setTimeout(() => router.push('/signup'), 2000);
      }
    } catch (error) {
      console.error('AI verification error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI.',
      });
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Account Verification</CardTitle>
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
                  <Avatar className="h-8 w-8 border bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 max-w-[80%] whitespace-pre-wrap',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback>You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
               <div className='flex items-start gap-3 justify-start'>
                  <Avatar className="h-8 w-8 border bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                  </Avatar>
                  <div className='rounded-lg px-3 py-2 max-w-[80%] bg-secondary flex items-center'>
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4">
        <form onSubmit={handleSubmit} className="w-full">
            <div className='flex items-end gap-2'>
                <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    rows={1}
                    className='min-h-0 resize-none'
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e as any);
                        }
                    }}
                />
                <Button type="submit" size="icon" className='shrink-0' disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </form>
      </CardFooter>
    </Card>
  );
}
