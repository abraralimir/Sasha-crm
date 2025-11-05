
'use client';

import { AddTaskForm } from '@/components/dashboard/add-task-form';
import { AddLeadForm } from '@/components/dashboard/add-lead-form';
import { RegisteredUsers } from '@/components/dashboard/registered-users';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your CRM, with real-time data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <RegisteredUsers />
        </div>

        <div className="space-y-8">
          <AddTaskForm />
          <AddLeadForm />
        </div>
      </div>
    </div>
  );
}
