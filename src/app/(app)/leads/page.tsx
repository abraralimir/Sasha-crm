'use client';
import { useState } from 'react';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2, PlusCircle, BrainCircuit, TrendingUp, AlertTriangle, Edit, Trash2 } from 'lucide-react';
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
import { assessLead } from '@/ai/flows/lead-risk-assessment';
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";


type LeadWithId = Lead & { id: string; lastContacted: Timestamp };

const leadStatuses: Lead['status'][] = ["New", "Contacted", "Proposal", "Closed", "Lost"];

export default function LeadsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<LeadWithId | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<LeadWithId | null>(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [isAiAlertOpen, setAiAlertOpen] = useState(false);
  const [aiAlertContent, setAiAlertContent] = useState<{ title: string; description: React.ReactNode } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);


  const leadsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'leads');
  }, [firestore]);

  const { data: leads, isLoading } = useCollection<LeadWithId>(leadsCollection);
  
  const handleEditOpen = (lead: LeadWithId) => {
    setLeadToEdit(lead);
    setFormOpen(true);
  };
  
  const handleDeleteOpen = (lead: LeadWithId) => {
    setLeadToDelete(lead);
    setDeleteAlertOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!firestore || !leadToDelete) return;
    try {
        await deleteDoc(doc(firestore, 'leads', leadToDelete.id));
        toast({
            title: "Lead Deleted",
            description: `The lead for ${leadToDelete.contactName} has been removed.`,
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: "Error",
            description: "Failed to delete lead.",
        });
    } finally {
        setDeleteAlertOpen(false);
        setLeadToDelete(null);
    }
  };

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

  const handleAiAction = async (lead: LeadWithId, action: 'risk' | 'roi') => {
      setIsAiLoading(lead.id);
      try {
          const assessment = await assessLead({
              contactName: lead.contactName,
              companyName: lead.companyName,
              email: lead.email,
              status: lead.status,
              potentialRevenue: lead.potentialRevenue,
              lastContacted: lead.lastContacted?.toDate().toISOString(),
          });
          
          let title, description;
          if (action === 'risk') {
              title = `Risk Assessment for ${lead.contactName}`;
              description = (
                  <div>
                      <p className="font-bold text-2xl mb-2">{assessment.riskScore}%</p>
                      <p className="text-sm text-muted-foreground">{assessment.reasoning}</p>
                  </div>
              );
          } else {
              title = `ROI Estimate for ${lead.contactName}`;
              description = (
                  <div>
                      <p className="font-bold text-2xl mb-2">{assessment.estimatedRoi}%</p>
                       <p className="text-sm text-muted-foreground">{assessment.reasoning}</p>
                  </div>
              );
          }
          setAiAlertContent({ title, description });
          setAiAlertOpen(true);

      } catch (error) {
          console.error("AI analysis failed:", error);
          toast({ variant: 'destructive', title: 'AI Analysis Failed', description: 'Could not get a response from the AI.'})
      } finally {
          setIsAiLoading(null);
      }
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
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setFormOpen(isOpen);
            if (!isOpen) setLeadToEdit(null);
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{leadToEdit ? 'Edit Lead' : 'Generate a New Lead'}</DialogTitle>
              <DialogDescription>
                {leadToEdit ? 'Update the details for this lead.' : 'Enter the details below to create a new lead.'}
              </DialogDescription>
            </DialogHeader>
            <AddLeadForm 
                lead={leadToEdit} 
                onFinished={() => {
                    setFormOpen(false);
                    setLeadToEdit(null);
                }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
          <CardDescription>
            Browse, search, and manage all available leads. Right-click for options.
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
                      <ContextMenu key={lead.id}>
                        <ContextMenuTrigger asChild>
                           <TableRow>
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
                              {isAiLoading === lead.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                              ) : (
                                <>
                                  <Button variant="ghost" size="icon" onClick={() => handleAiAction(lead, 'risk')} title="Assess Risk"><AlertTriangle className="h-4 w-4 text-destructive" /></Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleAiAction(lead, 'roi')} title="Estimate ROI"><TrendingUp className="h-4 w-4 text-green-500" /></Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem onSelect={() => handleEditOpen(lead)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Lead
                            </ContextMenuItem>
                            <ContextMenuItem onSelect={() => handleDeleteOpen(lead)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Lead
                            </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
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
    
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
             <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" />Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will permanently delete the lead for <span className="font-semibold text-foreground">"{leadToDelete?.contactName}"</span>. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={isAiAlertOpen} onOpenChange={setAiAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary"/>{aiAlertContent?.title}</AlertDialogTitle>
                <AlertDialogDescription asChild>
                    <div className="pt-2">{aiAlertContent?.description}</div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setAiAlertOpen(false)}>Close</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
