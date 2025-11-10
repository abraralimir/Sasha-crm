'use client';

import { Briefcase } from 'lucide-react';

export default function HRPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">HR Management</h1>
          <p className="text-muted-foreground">
            A centralized hub for all human resources activities.
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <Briefcase className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-6 text-xl font-semibold">Coming Soon</h2>
          <p className="mt-2 text-center text-muted-foreground">
            This HR module is under construction. Soon you'll be able to manage payroll, <br/> employee records, leave requests, and company policies.
          </p>
      </div>
    </div>
  );
}
