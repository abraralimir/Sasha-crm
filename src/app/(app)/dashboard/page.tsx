
'use client';

import { useMemo } from 'react';
import { collection, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { AddTaskForm } from '@/components/dashboard/add-task-form';
import { AddLeadForm } from '@/components/dashboard/add-lead-form';
import { RegisteredUsers } from '@/components/dashboard/registered-users';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { DollarSign, Users, ListChecks, Layers } from 'lucide-react';
import type { Lead, Task, Project, FinancialEntry } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { subDays } from 'date-fns';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getExchangeRates } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

type LeadWithId = Lead & { id: string; lastContacted: Timestamp };
type FinancialEntryWithId = FinancialEntry & { id: string };

export default function DashboardPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [exchangeRates, setExchangeRates] = useState<any>(null);

  useEffect(() => {
    async function fetchRates() {
      try {
        const rates = await getExchangeRates('USD');
        setExchangeRates(rates);
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load currency exchange rates. Totals may be inaccurate.",
        });
      }
    }
    fetchRates();
  }, [toast]);

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
  
  const projectsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'projects');
  }, [firestore]);
  const { data: projects, isLoading: projectsLoading } = useCollection<Project>(projectsCollection);

  const financialsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'financials');
  }, [firestore]);
  const { data: financials, isLoading: financialsLoading } = useCollection<FinancialEntryWithId>(financialsCollection);

  const kpis = useMemo(() => {
    const oneMonthAgo = subDays(new Date(), 30);
    
    const convertToUsd = (amount: number, currency: 'USD' | 'AED' | 'INR') => {
      if (!exchangeRates || currency === 'USD') return amount;
      return amount / (exchangeRates[currency] || 1);
    };

    const totalRevenue = financials
      ?.filter(f => f.type === 'Income')
      .reduce((acc, curr) => acc + convertToUsd(curr.amount, curr.currency), 0) || 0;

    const newLeadsCount = leads
      ?.filter(lead => lead.lastContacted?.toDate() > oneMonthAgo)
      .length || 0;
      
    const activeTasksCount = tasks
      ?.filter(task => task.status === 'To Do' || task.status === 'In Progress')
      .length || 0;

    const inProgressProjectsCount = projects
        ?.filter(project => project.status === 'In Progress')
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
      {
        title: "In Progress Projects",
        value: `${inProgressProjectsCount}`,
        icon: <Layers className="text-purple-500" />,
      },
    ];
  }, [leads, tasks, projects, financials, exchangeRates]);

  const isLoading = leadsLoading || tasksLoading || projectsLoading || financialsLoading || !exchangeRates;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          An overview of your CRM, with real-time data.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
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
