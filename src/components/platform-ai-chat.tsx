'use client';

import { useState } from 'react';
import { Bot, Loader2, Send, User, X } from 'lucide-react';
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
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

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
      const chatInput: PlatformAwareAIChatInput = { query: input, userId: user.uid };
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
      setMessages((prev) => prev.slice(0, -1)); // Remove the user message if AI fails
    } finally {
      setIsLoading(false);
    }
  };

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
                      'rounded-lg px-3 py-2 max-w-[80%]',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
              placeholder="e.g., 'Summarize the Innovate Inc. lead.'"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
