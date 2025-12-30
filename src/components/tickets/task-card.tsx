'use client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import type { Task, ProjectTask } from '@/lib/types';
import { Trash2, Edit } from 'lucide-react';
import { useDrag } from 'react-dnd';

interface TaskCardProps {
  task: Task | ProjectTask;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task | ProjectTask) => void;
}

const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
};

export function TaskCard({ task, onDelete, onEdit }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card
          ref={drag}
          className={`mb-4 cursor-grab ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{task.title}</CardTitle>
          </CardHeader>
          {task.description && (
            <CardContent className="py-2">
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </CardContent>
          )}
          <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-4">
            <span>
              {task.createdAt instanceof Timestamp 
                ? formatDistanceToNow(task.createdAt.toDate(), { addSuffix: true })
                : 'Recently'}
            </span>
            {task.assigneeName && (
               <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6">
                      {task.assigneeAvatar && <AvatarImage src={task.assigneeAvatar} />}
                      <AvatarFallback>{getInitials(task.assigneeName)}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{task.assigneeName}</p>
                  </TooltipContent>
                </Tooltip>
               </TooltipProvider>
            )}
          </CardFooter>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => onEdit(task)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Ticket
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => onDelete(task.id)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Ticket
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
