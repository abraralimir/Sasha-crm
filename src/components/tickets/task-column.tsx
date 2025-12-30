'use client';
import type { Task, ProjectTask } from '@/lib/types';
import { TaskCard } from './task-card';
import { ScrollArea } from '../ui/scroll-area';
import { useDrop } from 'react-dnd';

interface TaskColumnProps {
  status: 'To Do' | 'In Progress' | 'Done';
  tasks: (Task | ProjectTask)[];
  onTaskDrop: (taskId: string, newStatus: 'To Do' | 'In Progress' | 'Done') => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEdit: (task: Task | ProjectTask) => void;
}

const statusConfig = {
    'To Do': {
        title: 'To Do',
        color: 'bg-red-500'
    },
    'In Progress': {
        title: 'In Progress',
        color: 'bg-yellow-500'
    },
    'Done': {
        title: 'Done',
        color: 'bg-green-500'
    }
}

export function TaskColumn({ status, tasks, onTaskDrop, onTaskDelete, onTaskEdit }: TaskColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item: { id: string }) => onTaskDrop(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`rounded-lg p-4 transition-colors flex flex-col ${isOver ? 'bg-secondary' : 'bg-muted/50'}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-2.5 w-2.5 rounded-full ${statusConfig[status].color}`}></div>
        <h3 className="font-semibold text-lg">{statusConfig[status].title}</h3>
        <span className="text-sm text-muted-foreground ml-2 bg-secondary h-6 w-6 flex items-center justify-center rounded-full">{tasks.length}</span>
      </div>
      <ScrollArea className="h-[60vh] flex-1">
        <div className="pr-2 -mr-2">
            {tasks.length > 0 ? (
            tasks.map((task) => <TaskCard key={task.id} task={task} onDelete={onTaskDelete} onEdit={onTaskEdit} />)
            ) : (
            <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">Drop tasks here</p>
            </div>
            )}
        </div>
      </ScrollArea>
    </div>
  );
}
