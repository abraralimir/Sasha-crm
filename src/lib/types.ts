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

export type Task = {
    id: string;
    title: string;
    description: string;
    status: 'To Do' | 'In Progress' | 'Done';
    assigneeId?: string;
    assigneeName?: string;
    assigneeAvatar?: string;
    createdAt: any;
};

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    profilePictureUrl?: string;
};
