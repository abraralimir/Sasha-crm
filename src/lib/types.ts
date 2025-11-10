
import { Timestamp } from "firebase/firestore";

export type Lead = {
  id: string;
  contactName: string;
  companyName: string;
  email: string;
  status: 'New' | 'Contacted' | 'Proposal' | 'Closed' | 'Lost';
  potentialRevenue?: number;
  lastContacted: Timestamp;
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
    description?: string;
    status: 'To Do' | 'In Progress' | 'Done';
    assigneeId?: string;
    assigneeName?: string;
    assigneeAvatar?: string;
    createdAt: Timestamp;
};

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    profilePictureUrl?: string;
};

export type Notification = {
    id: string;
    title: string;
    message: string;
    link: string;
    read: boolean;
    createdAt: Timestamp;
};

export type FinancialEntry = {
    id:string;
    description: string;
    amount: number;
    type: 'Income' | 'Expense' | 'Investment';
    category: string;
    date: Timestamp;
    currency: 'USD' | 'AED' | 'INR';
    notes?: string;
};

export type Project = {
    id: string;
    projectName: string;
    slug: string;
    clientName: string;
    description: string;
    startDate: Timestamp;
    endDate: Timestamp;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
    budget?: number;
    team: string[]; // Array of user IDs
    aiGeneratedPlan?: GeneratedPlan;
};

export type ProjectTask = {
    id: string;
    title: string;
    description?: string;
    status: 'To Do' | 'In Progress' | 'Done';
    assigneeId?: string;
    assigneeName?: string;
    assigneeAvatar?: string;
    createdAt: Timestamp;
};

export type GeneratedPlan = {
  phases: Array<{
    phaseName: string;
    tasks: Array<{
      taskName: string;
      description: string;
      durationDays: number;
    }>;
  }>;
};

export type AttendanceLog = {
    id: string;
    userId: string;
    userName: string;
    type: 'check-in' | 'check-out' | 'break-start' | 'break-end';
    timestamp: Timestamp;
};

export type UserStatus = {
    id: string; // This will be the userId
    userName: string;
    userAvatar?: string;
    status: 'active' | 'away' | 'on-break' | 'offline';
    lastSeen: Timestamp;
    todayActiveSeconds: number;
};

export type PolicyDocument = {
    id: string;
    title: string;
    category: string;
    fileUrl: string;
    fileName: string;
    version: string;
    createdAt: Timestamp;
};
