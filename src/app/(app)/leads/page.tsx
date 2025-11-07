
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
import { assessLeadRisk, AssessLeadRiskOutput } from '@/ai/flows/assess-lead-risk';
import { predictLeadROI, PredictLeadROIOutput } from '@/ai/flows/predict-lead-roi';

type LeadWithId = Lead & { id: string; lastContacted: Timestamp };

const leadStatuses: Lead['status'][] = ["New", "Contacted", "Proposal", "Closed", "Lost"];

export default function LeadsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [isCreateLeadOpen, setCreateLeadOpen] = useState(false);
  const [isAiRiskOpen, setAiRiskOpen] = useState(false);
  const [isAiRoiOpen, setAiRoiOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadWithId | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<AssessLeadRiskOutput | null>(null);
  const [roiPrediction, setRoiPrediction] = useState<PredictLeadROIOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

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
  
  const handleAiRiskAnalysis = async (lead: LeadWithId) => {
    setSelectedLead(lead);
    setAiRiskOpen(true);
    setIsAiLoading(true);
    setRiskAnalysis(null);
    try {
      const result = await assessLeadRisk({
        leadDetails: JSON.stringify(lead),
        marketTrends: "Current market trends show a shift towards digital transformation in this sector.",
        historicalData: "Similar leads have a 25% conversion rate with an average deal size of $15,000."
      });
      setRiskAnalysis(result);
    } catch (e) {
      toast({ variant: 'destructive', title: 'AI Risk Analysis Failed' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiRoiPrediction = async (lead: LeadWithId) => {
    setSelectedLead(lead);
    setAiRoiOpen(true);
    setIsAiLoading(true);
    setRoiPrediction(null);
    try {
      const result = await predictLeadROI({
        leadDetails: JSON.stringify(lead),
        marketTrends: "High demand for AI-powered solutions in this vertical.",
        historicalData: "Past projects with similar scope yielded an average ROI of 350% over two years."
      });
      setRoiPrediction(result);
    } catch (e) {
      toast({ variant: 'destructive', title: 'AI ROI Prediction Failed' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredLeads = leads?.filter(lead =>
    lead.contactName.toLowerCase().includes(filter.toLowerCase()) ||
    lead.companyName.toLowerCase().includes(filter.toLowerCase()) ||
    lead.email.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => b.lastContacted.toMillis() - a.lastContacted.toMillis());

  const getRiskSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'high': return 'text-red-500';
    }
  }

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
                          <Button variant="ghost" size="icon" onClick={() => handleAiRiskAnalysis(lead)}><AlertTriangle className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleAiRoiPrediction(lead)}><TrendingUp className="h-4 w-4" /></Button>
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

    <Dialog open={isAiRiskOpen} onOpenChange={setAiRiskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><BrainCircuit /> AI Risk Analysis</DialogTitle>
            <DialogDescription>For lead: {selectedLead?.contactName}</DialogDescription>
          </DialogHeader>
          {isAiLoading ? <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
            riskAnalysis && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Overall Risk Score: {riskAnalysis.overallRiskScore}/100</h3>
                  <p className="text-sm text-muted-foreground">{riskAnalysis.recommendation}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Key Risk Factors:</h4>
                  {riskAnalysis.riskFactors.map((rf, i) => (
                    <Card key={i}>
                      <CardContent className="p-3">
                        <p className="font-semibold">{rf.factor} <span className={getRiskSeverityColor(rf.severity)}>({rf.severity})</span></p>
                        {rf.mitigationStrategy && <p className="text-xs text-muted-foreground mt-1">Suggestion: {rf.mitigationStrategy}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAiRoiOpen} onOpenChange={setAiRoiOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><TrendingUp /> AI ROI Prediction</DialogTitle>
            <DialogDescription>For lead: {selectedLead?.contactName}</DialogDescription>
          </DialogHeader>
          {isAiLoading ? <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin" /></div> : (
            roiPrediction && (
              <div className="space-y-4 text-center">
                <div className="text-4xl font-bold">{roiPrediction.predictedROI.toFixed(1)}%</div>
                <div className="text-sm">
                  <p className="font-semibold">Confidence Level: <span className="font-normal text-primary">{roiPrediction.confidenceLevel}</span></p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{roiPrediction.reasoning}</p>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
