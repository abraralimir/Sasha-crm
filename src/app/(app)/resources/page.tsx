'use client';

import { Users2 } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Management</h1>
          <p className="text-muted-foreground">
            Allocate and manage your team resources effectively.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <Users2 className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-xl font-semibold">Coming Soon</h2>
          <p className="mt-2 text-center text-muted-foreground">
            This section is under construction. Soon you'll be able to manage team capacity, <br/> view allocations, and plan resource needs for your projects.
          </p>
      </div>
    </div>
  );
}
