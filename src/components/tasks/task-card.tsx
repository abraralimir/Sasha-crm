'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
}

export const ItemTypes = {
  TASK: 'task',
};

export function TaskCard({ task }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TASK,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };
  
  const timeAgo = task.createdAt ? formatDistanceToNow(task.createdAt.toDate(), { addSuffix: true }) : 'Just now';


  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">{task.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{task.description}</CardDescription>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{timeAgo}</span>
          <div className="flex items-center gap-2">
            <span className='text-xs'>{task.assigneeName || 'Unassigned'}</span>
            <Avatar className="h-6 w-6">
              {task.assigneeAvatar && <AvatarImage src={task.assigneeAvatar} />}
              <AvatarFallback>{getInitials(task.assigneeName)}</AvatarFallback>
            </Avatar>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
