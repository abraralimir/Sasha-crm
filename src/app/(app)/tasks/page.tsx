'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AddTaskDialog } from '@/components/tasks/add-task-dialog';
import { TaskColumn } from '@/components/tasks/task-column';

const statuses: ('To Do' | 'In Progress' | 'Done')[] = ['To Do', 'In Progress', 'Done'];

export default function TasksPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Task Board</h1>
            <p className="text-muted-foreground">Manage your team's tasks in real-time.</p>
          </div>
          <AddTaskDialog />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          {statuses.map(status => (
            <TaskColumn key={status} status={status} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}
