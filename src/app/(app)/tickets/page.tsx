
'use client';
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2, Trash2, AlertTriangle, PlusCircle } from 'lucide-react';
import type { Task } from '@/lib/types';
import { TaskColumn } from '@/components/tickets/task-column';
import { AddTaskForm } from '@/components/dashboard/add-task-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function TicketsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isCreateTicketOpen, setCreateTicketOpen] = useState(false);

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

  const openDeleteDialog = (taskId: string) => {
    const task = tasks?.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setIsAlertOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!firestore || !taskToDelete) return;
    const taskRef = doc(firestore, 'tasks', taskToDelete.id);
    try {
      await deleteDoc(taskRef);
      toast({
        title: 'Ticket Deleted',
        description: `The ticket "${taskToDelete.title}" has been successfully removed.`,
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the ticket.',
      });
    } finally {
      setIsAlertOpen(false);
      setTaskToDelete(null);
    }
  };

  const columns: ('To Do' | 'In Progress' | 'Done')[] = ['To Do', 'In Progress', 'Done'];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tickets</h1>
            <p className="text-muted-foreground">
              A real-time Kanban board of all assigned tasks.
            </p>
          </div>
          <Dialog open={isCreateTicketOpen} onOpenChange={setCreateTicketOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Ticket</DialogTitle>
                <DialogDescription>Assign a new task to a team member.</DialogDescription>
              </DialogHeader>
              <AddTaskForm onTaskCreated={() => setCreateTicketOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-4">
            {columns.map(status => (
              <div key={status} className="min-w-[300px] flex-1">
                <TaskColumn
                  status={status}
                  tasks={tasks?.filter(task => task.status === status) || []}
                  onTaskDrop={handleTaskDrop}
                  onTaskDelete={openDeleteDialog}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-destructive" />
              Are you sure you want to delete this ticket?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the ticket
              titled: <span className="font-semibold text-foreground">"{taskToDelete?.title}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndProvider>
  );
}
