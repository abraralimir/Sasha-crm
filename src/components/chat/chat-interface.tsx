'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader2, Paperclip, Send, User, X } from 'lucide-react';
import { enableAIChatWithFileContext } from '@/ai/flows/ai-chat-with-file-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to get to the underlying div
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target?.result as string);
        setFileName(file.name);
        toast({
            title: "File Attached",
            description: `${file.name} is ready to be discussed.`
        })
      };
      reader.readAsText(file);
    }
  };
  
  const removeFile = () => {
    setFileContent(null);
    setFileName(null);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await enableAIChatWithFileContext({
        userQuery: input,
        fileContent: fileContent || 'No file attached.',
      });
      const assistantMessage: Message = { role: 'assistant', content: result.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI.',
      });
       setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        {/* Can be used for context later */}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messages.length === 0 && (
                 <div className="text-center text-muted-foreground p-8 h-full flex flex-col justify-center items-center">
                  <Bot className="mx-auto h-12 w-12" />
                  <p className="mt-2">Start a conversation or attach a file.</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                 {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback>AI</AvatarFallback>
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
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback>AI</AvatarFallback>
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
        <form onSubmit={handleSubmit} className="w-full space-y-2">
            {fileName && (
                <div className='flex items-center'>
                     <Badge variant="secondary" className='flex-1 justify-between'>
                        <span>{fileName}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={removeFile}>
                            <X className='h-3 w-3'/>
                        </Button>
                    </Badge>
                </div>
            )}
            <div className='flex items-end gap-2'>
                <Textarea
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message or attach a file..."
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
                <div className='flex gap-2'>
                    <Button asChild variant="outline" size="icon" className="shrink-0">
                        <label htmlFor="file-upload">
                            <Paperclip className="h-4 w-4" />
                            <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                    </Button>
                    <Button type="submit" size="icon" className='shrink-0' disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </form>
      </CardFooter>
    </Card>
  );
}
