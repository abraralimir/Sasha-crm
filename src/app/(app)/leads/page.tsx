
'use client';
import { useState } from 'react';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2, PlusCircle, BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddLeadForm } from '@/components/dashboard/add-lead-form';
import type { Lead } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type LeadWithId = Lead & { id: string; lastContacted: Timestamp };

const leadStatuses: Lead['status'][] = ["New", "Contacted", "Proposal", "Closed", "Lost"];

export default function LeadsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [isCreateLeadOpen, setCreateLeadOpen] = useState(false);

  const leadsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'leads');
  }, [firestore]);

  const { data: leads, isLoading } = useCollection<LeadWithId>(leadsCollection);

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    if (!firestore) return;
    const leadRef = doc(firestore, 'leads', leadId);
    try {
      await updateDoc(leadRef, { status: newStatus, lastContacted: Timestamp.now() });
      toast({
        title: 'Status Updated',
        description: `Lead status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error('Failed to update lead status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update lead status.',
      });
    }
  };

  const handleAiAction = () => {
      toast({
          variant: "destructive",
          title: "AI Feature Unavailable",
          description: "This feature has been temporarily disabled."
      })
  }

  const filteredLeads = leads?.filter(lead =>
    lead.contactName.toLowerCase().includes(filter.toLowerCase()) ||
    lead.companyName.toLowerCase().includes(filter.toLowerCase()) ||
    lead.email.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => b.lastContacted.toMillis() - a.lastContacted.toMillis());

  return (
    <>
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Generated Leads</h1>
          <p className="text-muted-foreground">
            A real-time list of all potential customers and deals.
          </p>
        </div>
        <Dialog open={isCreateLeadOpen} onOpenChange={setCreateLeadOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Generate a New Lead</DialogTitle>
              <DialogDescription>
                Enter the details below to create a new lead in the system.
              </DialogDescription>
            </DialogHeader>
            <AddLeadForm onLeadCreated={() => setCreateLeadOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            Browse, search, and manage all available leads.
          </CardDescription>
           <div className="pt-4">
              <Input
                placeholder="Filter by name, company, or email..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="hidden lg:table-cell">Potential Revenue</TableHead>
                    <TableHead className="hidden md:table-cell">Last Contacted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">AI Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads && filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.contactName}</TableCell>
                        <TableCell>{lead.companyName}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {lead.potentialRevenue ? `$${lead.potentialRevenue.toLocaleString()}`: 'N/A'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                            {lead.lastContacted ? format(lead.lastContacted.toDate(), 'PPP') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Select value={lead.status} onValueChange={(newStatus: Lead['status']) => handleStatusChange(lead.id, newStatus)}>
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {leadStatuses.map(status => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={handleAiAction}><AlertTriangle className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={handleAiAction}><TrendingUp className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {leads && leads.length > 0 ? "No leads match your filter." : "No leads found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
