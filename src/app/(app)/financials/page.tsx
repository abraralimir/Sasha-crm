
'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { FinancialEntry } from '@/lib/types';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Loader2, PlusCircle, Trash2, Edit, BrainCircuit, AlertTriangle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { FinancialEntryForm } from '@/components/financials/financial-entry-form';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { getExchangeRates, ExchangeRates } from '@/lib/currency';
import { Skeleton } from '@/components/ui/skeleton';

type FinancialEntryWithId = FinancialEntry & { id: string; };

export default function FinancialsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFormOpen, setFormOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<FinancialEntryWithId | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<FinancialEntryWithId | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

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

  const financialsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'financials');
  }, [firestore]);

  const { data: financials, isLoading } = useCollection<FinancialEntryWithId>(financialsCollection);

  const financialSummary = useMemo(() => {
    if (!financials || !exchangeRates) {
      return { totalRevenue: 0, totalExpenses: 0, netProfit: 0 };
    }
    
    const convertToUsd = (amount: number, currency: 'USD' | 'AED' | 'INR') => {
      if (currency === 'USD') return amount;
      return amount / (exchangeRates[currency] || 1);
    };

    const totalRevenue = financials
      .filter(f => f.type === 'Income')
      .reduce((acc, curr) => acc + convertToUsd(curr.amount, curr.currency), 0);
      
    const totalExpenses = financials
      .filter(f => f.type === 'Expense')
      .reduce((acc, curr) => acc + convertToUsd(curr.amount, curr.currency), 0);

    const netProfit = totalRevenue - totalExpenses;
    return { totalRevenue, totalExpenses, netProfit };
  }, [financials, exchangeRates]);

  const handleOpenForm = (entry?: FinancialEntryWithId) => {
    setEntryToEdit(entry || null);
    setFormOpen(true);
  };

  const handleOpenDeleteAlert = (entry: FinancialEntryWithId) => {
    setEntryToDelete(entry);
    setDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!firestore || !entryToDelete) return;
    const docRef = doc(firestore, 'financials', entryToDelete.id);
    try {
      await deleteDoc(docRef);
      toast({
        title: 'Entry Deleted',
        description: `The financial entry has been successfully removed.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete the financial entry.',
      });
    } finally {
      setDeleteAlertOpen(false);
      setEntryToDelete(null);
    }
  };
  
  const handleAiAnalysis = async () => {
    toast({
        variant: "destructive",
        title: "AI Feature Unavailable",
        description: "This feature has been temporarily disabled.",
    });
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };
  
  const renderKpiValue = (amount: number) => {
    if (isLoading || !exchangeRates) return <Skeleton className="h-8 w-32" />;
    return formatCurrency(amount, 'USD');
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financials</h1>
          <p className="text-muted-foreground">Track and analyze your income, expenses, and investments.</p>
        </div>
        <div className="flex gap-2">
            <Button onClick={handleAiAnalysis} disabled={isAiLoading || !financials || financials.length === 0}>
                {isAiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                Analyze with AI
            </Button>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Total Revenue (USD)" value={renderKpiValue(financialSummary.totalRevenue)} icon={<TrendingUp className="text-green-500" />} />
        <KpiCard title="Total Expenses (USD)" value={renderKpiValue(financialSummary.totalExpenses)} icon={<TrendingDown className="text-red-500" />} />
        <KpiCard title="Net Profit/Loss (USD)" value={renderKpiValue(financialSummary.netProfit)} icon={<DollarSign className={financialSummary.netProfit >= 0 ? "text-primary" : "text-destructive"} />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Entries</CardTitle>
          <CardDescription>A complete log of all financial transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {financials && financials.length > 0 ? (
                    financials.sort((a,b) => b.date.toMillis() - a.date.toMillis()).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell>{entry.type}</TableCell>
                        <TableCell>{entry.category}</TableCell>
                        <TableCell>{format(entry.date.toDate(), 'PPP')}</TableCell>
                        <TableCell className={`text-right font-mono ${entry.type === 'Income' ? 'text-green-500' : 'text-red-500'}`}>
                          {entry.type === 'Income' ? '+' : '-'}{formatCurrency(entry.amount, entry.currency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenForm(entry)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteAlert(entry)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">No financial entries found. Add one to get started.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{entryToEdit ? 'Edit' : 'Add'} Financial Entry</DialogTitle>
            <DialogDescription>
              {entryToEdit ? 'Update the details for this financial entry.' : 'Add a new transaction to your records.'}
            </DialogDescription>
          </DialogHeader>
          <FinancialEntryForm
            entry={entryToEdit}
            onFinished={() => { setFormOpen(false); setEntryToEdit(null); }}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the entry: <span className="font-semibold text-foreground">"{entryToDelete?.description}"</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
