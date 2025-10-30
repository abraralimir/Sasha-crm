'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Task } from '@/lib/types';
import { TaskCard, ItemTypes } from './task-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface TaskColumnProps {
  status: 'To Do' | 'In Progress' | 'Done';
}

export function TaskColumn({ status }: TaskColumnProps) {
  const firestore = useFirestore();
  
  const tasksCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tasks');
  }, [firestore]);

  const { data: tasks, isLoading } = useCollection<Task>(tasksCollection);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.TASK,
    drop: (item: { id: string; status: string }) => handleDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const handleDrop = async (item: { id: string; status: string }) => {
    if (item.status !== status) {
        if (!firestore) return;
      const taskRef = doc(firestore, 'tasks', item.id);
      await updateDoc(taskRef, { status: status });
    }
  };

  const filteredTasks = tasks?.filter(task => task.status === status) || [];

  return (
    <Card ref={drop} className={`flex flex-col ${isOver ? 'bg-secondary' : ''}`}>
      <CardHeader>
        <CardTitle>{status}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <ScrollArea className="h-full max-h-[calc(100vh-20rem)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          )}
          {!isLoading && filteredTasks.length === 0 && (
            <div className="text-center text-muted-foreground p-4">No tasks in this column.</div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
