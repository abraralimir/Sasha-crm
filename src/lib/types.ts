export type Lead = {
  id: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Proposal' | 'Closed' | 'Lost';
  potentialRevenue: number;
  lastContacted: string; // ISO date string
  avatar: string; // URL
  notes: string;
  projectScope: string;
  projectComplexity: 'Low' | 'Medium' | 'High';
  historicalData: string;
  marketTrends: string;
};

export type Kpi = {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  description: string;
};
