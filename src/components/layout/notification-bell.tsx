'use client';

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, orderBy, query, writeBatch } from 'firebase/firestore';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Notification } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function NotificationBell() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const notificationsCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/notifications`);
  }, [firestore, user]);

  const notificationsQuery = useMemoFirebase(() => {
    if (!notificationsCollection) return null;
    return query(notificationsCollection, orderBy('createdAt', 'desc'));
  }, [notificationsCollection]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && notifications && unreadCount > 0 && firestore && user) {
      // Mark all as read
      const batch = writeBatch(firestore);
      notifications.forEach(notification => {
        if (!notification.read) {
          const notifRef = doc(firestore, `users/${user.uid}/notifications`, notification.id);
          batch.update(notifRef, { read: true });
        }
      });
      try {
        await batch.commit();
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not mark notifications as read."
        })
      }
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 font-medium border-b">
          Notifications
        </div>
        <ScrollArea className="h-96">
          <div className="p-2">
            {notifications && notifications.length > 0 ? (
              notifications.map(notification => (
                <Link href={notification.link} key={notification.id} passHref>
                    <div 
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer"
                        onClick={() => setIsOpen(false)}
                    >
                    <div className={cn("h-2.5 w-2.5 mt-2 rounded-full", !notification.read ? 'bg-primary' : 'bg-transparent')}></div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                        </p>
                    </div>
                    </div>
                </Link>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-8">
                <CheckCheck className="mx-auto h-10 w-10" />
                <p className="mt-2">You're all caught up!</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
