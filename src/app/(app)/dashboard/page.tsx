
'use client';

import { AddTaskForm } from '@/components/dashboard/add-task-form';
import { AddLeadForm } from '@/components/dashboard/add-lead-form';
import { RegisteredUsers } from '@/components/dashboard/registered-users';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DollarSign, Users, ListChecks } from 'lucide-react';

const kpis = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      changeType: "increase" as const,
      description: "from last month",
      icon: <DollarSign className="text-green-500" />,
    },
    {
      title: "New Leads",
      value: "+235",
      change: "+180.1%",
      changeType: "increase" as const,
      description: "from last month",
      icon: <Users className="text-blue-500" />,
    },
    {
      title: "Active Tasks",
      value: "57",
      change: "-2.4%",
      changeType: "decrease" as const,
      description: "from last week",
      icon: <ListChecks className="text-yellow-500" />,
    },
  ];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your CRM, with real-time data.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <OverviewChart />
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
