'use client';
import { useDrag } from 'react-dnd';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
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

export function TaskCard({ task }: TaskCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK',
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  return (
    <Card
      ref={drag}
      className={`mb-4 cursor-grab ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{task.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{task.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
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
  );
}
