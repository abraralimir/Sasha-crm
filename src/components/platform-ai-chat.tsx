'use client';

import { useState } from 'react';
import { Bot, Loader2, Send, X } from 'lucide-react';
import { platformAwareAIChat, PlatformAwareAIChatInput } from '@/ai/flows/platform-aware-ai-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Lead, Task, UserProfile } from '@/lib/types';


type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function PlatformAiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  // Hooks to fetch all relevant data
  const leadsCollection = useMemoFirebase(() => firestore ? collection(firestore, 'leads') : null, [firestore]);
  const tasksCollection = useMemoFirebase(() => firestore ? collection(firestore, 'tasks') : null, [firestore]);
  const usersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);

  const { data: leads, isLoading: leadsLoading } = useCollection<Lead>(leadsCollection);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksCollection);
  const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersCollection);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatInput: PlatformAwareAIChatInput = { 
        query: input, 
        userId: user.uid,
        leadsJson: JSON.stringify(leads || []),
        tasksJson: JSON.stringify(tasks || []),
        usersJson: JSON.stringify(users || []),
      };
      const result = await platformAwareAIChat(chatInput);
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI assistant.',
      });
      // Do not remove the user's message on failure, so they can retry
    } finally {
      setIsLoading(false);
    }
  };
  
  const isDataLoading = leadsLoading || tasksLoading || usersLoading;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Bot className="mr-2" />
          Ask Sasha AI
        </Button>
      </SheetTrigger>
      <SheetContent className="flex h-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Platform Assistant</SheetTitle>
          <SheetDescription>
            Ask Sasha AI anything about your leads, projects, and platform data.
            {isDataLoading && <span className='text-xs text-muted-foreground block animate-pulse'>Loading platform data...</span>}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                  <Bot className="mx-auto h-12 w-12" />
                  <p className="mt-2">Start a conversation!</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 max-w-[80%] whitespace-pre-wrap',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    )}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                     <Avatar className="h-8 w-8">
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                 <div className='flex items-start gap-3 justify-start'>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className='rounded-lg px-3 py-2 max-w-[80%] bg-secondary flex items-center'>
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={isDataLoading ? "Sasha is synching..." : "e.g., 'How many new leads?'"}
              disabled={isLoading || isDataLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim() || isDataLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
