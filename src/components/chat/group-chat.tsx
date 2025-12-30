
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Loader2, Send, Paperclip, Sparkles, EllipsisVertical, File, ListPlus, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, getDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import type { UserProfile, ChatGroup, ChatMessage } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { AddTaskForm } from '../dashboard/add-task-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Input } from '../ui/input';


export function GroupChat({ groupId }: { groupId: string }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [openCreateTicketDialog, setOpenCreateTicketDialog] = useState(false);
  const [ticketMessage, setTicketMessage] = useState<ChatMessage | null>(null);
  const [group, setGroup] = useState<ChatGroup | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<ChatMessage | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesCollectionPath = useMemo(() => {
    return groupId === 'main' ? 'messages' : `groups/${groupId}/messages`;
  }, [groupId]);

  const messagesCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, messagesCollectionPath);
  }, [firestore, messagesCollectionPath]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesCollection) return null;
    return query(messagesCollection, orderBy('timestamp', 'asc'));
  }, [messagesCollection]);

  const { data: messages, isLoading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);
  
  useEffect(() => {
    async function fetchGroup() {
        if (!firestore || groupId === 'main') {
            setGroup(null);
            return;
        };
        const groupDocRef = doc(firestore, 'groups', groupId);
        const groupDoc = await getDoc(groupDocRef);
        if (groupDoc.exists()) {
            setGroup({ id: groupDoc.id, ...groupDoc.data() } as ChatGroup);
        } else {
            setGroup(null);
        }
    }
    fetchGroup();
  }, [firestore, groupId]);
  
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
  
  const createPushNotificationRequest = (group: ChatGroup, messageText: string) => {
    if (!firestore || !user) return;
    
    const notificationRequestPayload = {
        groupId: group.id,
        groupName: group.name,
        senderId: user.uid,
        senderName: user.displayName,
        messageText: messageText,
        createdAt: serverTimestamp(),
    };
    const notificationRequestsCollection = collection(firestore, 'notificationRequests');
    addDoc(notificationRequestsCollection, notificationRequestPayload);
  }

  const sendMessage = (messagePayload: Omit<ChatMessage, 'id' | 'timestamp' | 'groupId'> & { timestamp: any }) => {
    if (!messagesCollection) return;
    setIsLoading(true);

    const payloadWithGroup = { ...messagePayload, groupId };

    addDoc(messagesCollection, payloadWithGroup)
      .then(() => {
          if (group && messagePayload.text) { 
            createPushNotificationRequest(group, messagePayload.text);
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
        const fileMessageText = `File: ${file.name}`;
        sendMessage({
            type: 'file',
            text: fileMessageText,
            fileName: file.name,
            userId: user.uid,
            userName: user.displayName || 'Anonymous User',
            userAvatar: user.photoURL || null,
            timestamp: serverTimestamp(),
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
    toast({
        variant: "destructive",
        title: "AI Feature Unavailable",
        description: "This feature has been temporarily disabled."
    })
  };

  const handleCreateTicket = (message: ChatMessage) => {
    setTicketMessage(message);
    setOpenCreateTicketDialog(true);
  };
  
  const handleDeleteRequest = (message: ChatMessage) => {
    if (message.userId !== user?.uid) {
        toast({ variant: 'destructive', title: 'Permission Denied', description: "You can only delete your own messages." });
        return;
    }
    setMessageToDelete(message);
    setDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete || !messagesCollection) return;
    try {
        await deleteDoc(doc(messagesCollection, messageToDelete.id));
        toast({ title: 'Message Deleted' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: "Failed to delete message." });
    } finally {
        setDeleteAlertOpen(false);
        setMessageToDelete(null);
    }
  };


  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <h3 className="text-lg font-semibold">{group?.name || 'General Chat'}</h3>
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
                  <p>No messages yet. Be the first to start the conversation!</p>
                </div>
              )}
              {messages?.map((message) => (
                <ContextMenu key={message.id}>
                    <ContextMenuTrigger>
                        <div
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
                    </ContextMenuTrigger>
                    {message.userId === user?.uid && (
                        <ContextMenuContent>
                             <ContextMenuItem onSelect={() => handleDeleteRequest(message)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Message
                            </ContextMenuItem>
                        </ContextMenuContent>
                    )}
                </ContextMenu>
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
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>Create a New Ticket</DialogTitle>
                <DialogDescription>Convert this message into an actionable task.</DialogDescription>
            </DialogHeader>
            <AddTaskForm
                defaultTitle={ticketMessage?.type === 'text' ? ticketMessage.text : ticketMessage?.fileName}
                onTaskCreated={() => setOpenCreateTicketDialog(false)}
            />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" />Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this message. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
