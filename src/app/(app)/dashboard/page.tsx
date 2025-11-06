
'use client';

import { useMemo } from 'react';
import { collection, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { AddTaskForm } from '@/components/dashboard/add-task-form';
import { AddLeadForm } from '@/components/dashboard/add-lead-form';
import { RegisteredUsers } from '@/components/dashboard/registered-users';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DollarSign, Users, ListChecks, Loader2 } from 'lucide-react';
import type { Lead, Task } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { subDays } from 'date-fns';

type LeadWithId = Lead & { id: string; lastContacted: Timestamp };

export default function DashboardPage() {
  const firestore = useFirestore();

  const leadsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'leads');
  }, [firestore]);
  const { data: leads, isLoading: leadsLoading } = useCollection<LeadWithId>(leadsCollection);

  const tasksCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tasks');
  }, [firestore]);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksCollection);
  
  const kpis = useMemo(() => {
    const oneMonthAgo = subDays(new Date(), 30);

    const totalRevenue = leads
      ?.filter(lead => lead.status === 'Closed' && lead.potentialRevenue)
      .reduce((acc, lead) => acc + (lead.potentialRevenue || 0), 0) || 0;

    const newLeadsCount = leads
      ?.filter(lead => lead.lastContacted.toDate() > oneMonthAgo)
      .length || 0;
      
    const activeTasksCount = tasks
      ?.filter(task => task.status === 'To Do' || task.status === 'In Progress')
      .length || 0;

    return [
      {
        title: "Total Revenue",
        value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: <DollarSign className="text-green-500" />,
      },
      {
        title: "New Leads (30d)",
        value: `+${newLeadsCount}`,
        icon: <Users className="text-blue-500" />,
      },
      {
        title: "Active Tasks",
        value: `${activeTasksCount}`,
        icon: <ListChecks className="text-yellow-500" />,
      },
    ];
  }, [leads, tasks]);

  const isLoading = leadsLoading || tasksLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your CRM, with real-time data.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                        <Skeleton className="h-3 w-full" />
                    </CardContent>
                </Card>
            ))
        ) : (
            kpis.map((kpi) => (
                <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} />
            ))
        )}
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

