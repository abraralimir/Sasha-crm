
'use client';
import { useState } from 'react';
import { collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

type LeadWithId = Lead & { id: string; lastContacted: Timestamp };

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' } = {
  New: 'default',
  Contacted: 'secondary',
  Proposal: 'secondary',
  Closed: 'default',
  Lost: 'destructive',
};

export default function LeadsPage() {
  const firestore = useFirestore();
  const [filter, setFilter] = useState('');

  const leadsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'leads');
  }, [firestore]);

  const { data: leads, isLoading } = useCollection<LeadWithId>(leadsCollection);

  const filteredLeads = leads?.filter(lead =>
    lead.contactName.toLowerCase().includes(filter.toLowerCase()) ||
    lead.companyName.toLowerCase().includes(filter.toLowerCase()) ||
    lead.email.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => b.lastContacted.toMillis() - a.lastContacted.toMillis());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Generated Leads</h1>
        <p className="text-muted-foreground">
          A real-time list of all potential customers and deals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            Browse and search through all available leads.
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
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Potential Revenue</TableHead>
                    <TableHead className="hidden md:table-cell">Last Contacted</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads && filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.contactName}</TableCell>
                        <TableCell>{lead.companyName}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{lead.email}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {lead.potentialRevenue ? `$${lead.potentialRevenue.toLocaleString()}`: 'N/A'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                            {lead.lastContacted ? format(lead.lastContacted.toDate(), 'PPP') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[lead.status] || 'default'}>
                            {lead.status}
                          </Badge>
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
  );
}
