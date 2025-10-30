'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Send } from 'lucide-react';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

type ChatMessage = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  timestamp: Timestamp;
};

export function GroupChat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const messagesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'messages');
  }, [firestore]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesCollection) return null;
    return query(messagesCollection, orderBy('timestamp', 'asc'));
  }, [messagesCollection]);

  const { data: messages, isLoading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    if (!input.trim() || !user || !messagesCollection) return;

    setIsLoading(true);
    const messageText = input;
    setInput('');

    try {
      await addDoc(messagesCollection, {
        text: messageText,
        userId: user.uid,
        userName: user.displayName || 'Anonymous User',
        userAvatar: user.photoURL || null,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message.',
      });
      // Restore input if sending failed
      setInput(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <h3 className="text-lg font-semibold">Team Collaboration Chat</h3>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {messagesLoading && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {!messagesLoading && messages && messages.length === 0 && (
              <div className="text-center text-muted-foreground p-8">
                <p>No messages yet. Be the first to start a conversation!</p>
              </div>
            )}
            {messages?.map((message) => (
              <div
                key={message.id}
                className={cn('flex items-start gap-3', message.userId === user?.uid ? 'justify-end' : 'justify-start')}
              >
                {message.userId !== user?.uid && (
                  <Avatar className="h-8 w-8 border">
                    {message.userAvatar ? <AvatarImage src={message.userAvatar} /> : null}
                    <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'rounded-lg px-3 py-2 max-w-[70%] whitespace-pre-wrap',
                    message.userId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  )}
                >
                  {message.userId !== user?.uid && (
                     <p className="text-xs font-bold mb-1">{message.userName}</p>
                  )}
                  <p className="text-sm">{message.text}</p>
                   <p className="text-xs text-right mt-1 opacity-70">
                    {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.userId === user?.uid && (
                  <Avatar className="h-8 w-8 border">
                    {user?.photoURL && <AvatarImage src={user.photoURL} />}
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
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
              disabled={isLoading || !user}
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
