'use client';

import { GanttChart } from 'lucide-react';

export default function ProjectTasksPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Tasks</h1>
          <p className="text-muted-foreground">
            A comprehensive view of all tasks across all projects.
          </p>
        </div>
      </div>
       <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <GanttChart className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-xl font-semibold">Coming Soon</h2>
          <p className="mt-2 text-center text-muted-foreground">
            This section is under construction. Soon you'll see a Gantt chart view, <br/> advanced filtering, and task dependencies across all your projects.
          </p>
      </div>
    </div>
  );
}
