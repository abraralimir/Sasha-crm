
'use client';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import type { Task } from '@/lib/types';
import { TaskColumn } from '@/components/tickets/task-column';

export default function TicketsPage() {
  const firestore = useFirestore();

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tasks');
  }, [firestore]);

  const { data: tasks, isLoading } = useCollection<Task>(tasksCollection);

  const handleTaskDrop = async (taskId: string, newStatus: 'To Do' | 'In Progress' | 'Done') => {
    if (!firestore) return;
    const taskRef = doc(firestore, 'tasks', taskId);
    try {
      await updateDoc(taskRef, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const columns: ('To Do' | 'In Progress' | 'Done')[] = ['To Do', 'In Progress', 'Done'];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">
            A real-time Kanban board of all assigned tasks.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(status => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasks?.filter(task => task.status === status) || []}
                onTaskDrop={handleTaskDrop}
              />
            ))}
          </div>
        )}
      </div>
    </DndProvider>
  );
}
