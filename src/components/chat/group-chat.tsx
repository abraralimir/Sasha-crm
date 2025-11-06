
'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Send, Paperclip, Sparkles, EllipsisVertical, File, ListPlus } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, getDocs, writeBatch, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddTaskForm } from '../dashboard/add-task-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { enableAIChatWithFileContext } from '@/ai/flows/ai-chat-with-file-context';
import { addDocumentNonBlocking } from '@/firebase';

type ChatMessage = {
  id: string;
  type: 'text' | 'file';
  text: string;
  fileName?: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  timestamp: Timestamp;
};

export function GroupChat() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [openCreateTicketDialog, setOpenCreateTicketDialog] = useState(false);
  const [ticketMessage, setTicketMessage] = useState<ChatMessage | null>(null);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  const createNotificationsForOtherUsers = async (messageText: string) => {
    if (!firestore || !user) return;
  
    try {
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const otherUsers = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as UserProfile))
        .filter(u => u.id !== user.uid);
  
      const batch = writeBatch(firestore);
  
      otherUsers.forEach(otherUser => {
        const notificationRef = doc(collection(firestore, 'users', otherUser.id, 'notifications'));
        const notificationPayload = {
          title: `New message from ${user.displayName}`,
          message: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
          link: '/chat',
          read: false,
          createdAt: serverTimestamp(),
        };
        batch.set(notificationRef, notificationPayload);
      });
  
      await batch.commit();
    } catch (error) {
      console.error("Failed to create chat notifications:", error);
    }
  };

  const sendMessage = (messagePayload: Omit<ChatMessage, 'id' | 'timestamp'> & { timestamp: any }) => {
    if (!messagesCollection) return;
    setIsLoading(true);

    addDocumentNonBlocking(messagesCollection, messagePayload)
      .then(() => {
          if (messagePayload.type === 'text') {
            createNotificationsForOtherUsers(messagePayload.text);
          } else if (messagePayload.fileName) {
            createNotificationsForOtherUsers(`File: ${messagePayload.fileName}`);
          }
      })
      .catch((error) => {
          console.error('Error sending message:', error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to send message.',
          });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const messageText = input;
    setInput('');

    sendMessage({
      type: 'text',
      text: messageText,
      userId: user.uid,
      userName: user.displayName || 'Anonymous User',
      userAvatar: user.photoURL || null,
      timestamp: serverTimestamp(),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
        // Placeholder for actual file upload to Firebase Storage
        sendMessage({
            type: 'file',
            text: `File: ${file.name}`,
            fileName: file.name,
            userId: user.uid,
            userName: user.displayName || 'Anonymous User',
            userAvatar: user.photoURL || null,
            timestamp: serverTimestamp()
        });
        toast({
            title: "File attached",
            description: `${file.name} was attached to the chat. File uploads are coming soon!`,
        });
    }
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleAiAction = async () => {
    if (!input.trim()) {
        toast({
            variant: 'destructive',
            title: 'Prompt required',
            description: 'Please enter a prompt for the AI to generate a response.',
        });
        return;
    }
    setIsAiLoading(true);
    try {
        const result = await enableAIChatWithFileContext({ userQuery: input });
        setInput(result.response);
    } catch (error) {
        console.error("Error with AI action", error);
        toast({
            variant: 'destructive',
            title: 'AI Error',
            description: 'Failed to get a response from the AI.',
        });
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleCreateTicket = (message: ChatMessage) => {
    setTicketMessage(message);
    setOpenCreateTicketDialog(true);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <>
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
                  className={cn('group flex items-start gap-3', message.userId === user?.uid ? 'justify-end' : 'justify-start')}
                >
                  {message.userId !== user?.uid && (
                    <Avatar className="h-8 w-8 border">
                      {message.userAvatar ? <AvatarImage src={message.userAvatar} /> : null}
                      <AvatarFallback>{getInitials(message.userName)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 max-w-[70%] break-words',
                      message.userId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    )}
                  >
                    {message.userId !== user?.uid && (
                       <p className="text-xs font-bold mb-1">{message.userName}</p>
                    )}

                    {message.type === 'file' ? (
                        <div className="flex items-center gap-2">
                            <File className="h-6 w-6" />
                            <span className="text-sm font-medium underline">{message.fileName}</span>
                        </div>
                    ) : (
                        <p className="text-sm">{message.text}</p>
                    )}

                     <p className="text-xs text-right mt-1 opacity-70">
                      {message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                   <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <EllipsisVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleCreateTicket(message)}>
                                    <ListPlus className="mr-2 h-4 w-4" />
                                    <span>Create Ticket</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                placeholder="Type your message or use AI..."
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
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
              <Button type="button" size="icon" className="shrink-0" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                <Paperclip className="h-4 w-4" />
              </Button>
               <Button type="button" size="icon" className="shrink-0" variant="outline" onClick={handleAiAction} disabled={isLoading || isAiLoading}>
                {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4" />}
              </Button>
              <Button type="submit" size="icon" className='shrink-0' disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardFooter>
      </Card>
      
      <Dialog open={openCreateTicketDialog} onOpenChange={setOpenCreateTicketDialog}>
        <DialogContent className="max-w-lg w-full">
            <DialogHeader>
                <DialogTitle>Create a New Ticket</DialogTitle>
                <DialogDescription>Convert this message into an actionable task.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] p-1">
                <div className="p-4">
                    <AddTaskForm
                        defaultTitle={ticketMessage?.type === 'text' ? ticketMessage.text : ticketMessage?.fileName}
                        onTaskCreated={() => setOpenCreateTicketDialog(false)}
                    />
                </div>
            </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
