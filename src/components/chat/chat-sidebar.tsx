
'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { ChatGroup, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateGroupForm } from './create-group-form';
import { Loader2, PlusCircle, Users, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export function ChatSidebar({ onSelectGroup }: { onSelectGroup: (groupId: string) => void }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedGroup, setSelectedGroup] = useState('main');
  const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);

  const groupsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'groups'),
      where('members', 'array-contains', user.uid)
    );
  }, [firestore, user]);

  const { data: groups, isLoading } = useCollection<ChatGroup>(groupsQuery);

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroup(groupId);
    onSelectGroup(groupId);
  };

  return (
    <div className="w-64 border-r flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Conversations</h2>
        <Dialog open={isCreateGroupOpen} onOpenChange={setCreateGroupOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>Select members to start a new conversation.</DialogDescription>
            </DialogHeader>
            <CreateGroupForm onFinished={() => setCreateGroupOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex justify-center items-center h-full p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="p-2 space-y-1">
             <div
                onClick={() => handleGroupSelect('main')}
                className={cn(
                    'flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer',
                    selectedGroup === 'main'
                    ? 'bg-secondary font-semibold'
                    : 'hover:bg-secondary/50'
                )}
                >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm">
                    <MessageSquare className="h-5 w-5" />
                </div>
                <span className="flex-1 truncate">General Chat</span>
            </div>
            {groups?.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupSelect(group.id)}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer',
                  selectedGroup === group.id
                    ? 'bg-secondary font-semibold'
                    : 'hover:bg-secondary/50'
                )}
              >
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm">
                  <Users className="h-5 w-5" />
                </div>
                <span className="flex-1 truncate">{group.name}</span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
