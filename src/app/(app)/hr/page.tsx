
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { UserProfile, AttendanceLog, Task, LeaveRequest, PolicyDocument } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, AlertCircle, PlusCircle, Briefcase, FileText, Banknote, CalendarDays, Download, ThumbsUp, ThumbsDown, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LeaveRequestForm } from '@/components/hr/leave-request-form';
import { PolicyUploadForm } from '@/components/hr/policy-upload-form';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

type UserReport = {
    user: UserProfile;
    workHoursToday: number;
    checkInTime: Date | null;
    checkOutTime: Date | null;
    assignedTickets: number;
    completedTickets: number;
};

const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatDuration = (totalSeconds: number) => {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
};

const getStatusBadgeVariant = (status: 'Pending' | 'Approved' | 'Denied') => {
    switch (status) {
        case 'Approved': return 'default';
        case 'Pending': return 'secondary';
        case 'Denied': return 'destructive';
        default: return 'outline';
    }
}

function EmployeeReportTab() {
  const firestore = useFirestore();
  const [reportData, setReportData] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const usersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: allUsers } = useCollection<UserProfile>(usersCollection);

  useEffect(() => {
    if (!firestore || !allUsers) return;

    const generateReport = async () => {
        setIsLoading(true);
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        
        const attendanceQuery = query(
            collection(firestore, 'attendance'),
            where('timestamp', '>=', todayStart),
            where('timestamp', '<=', todayEnd)
        );

        const tasksQuery = collection(firestore, 'tasks');

        const [attendanceSnapshot, tasksSnapshot] = await Promise.all([
            getDocs(attendanceQuery),
            getDocs(tasksQuery)
        ]);

        const attendanceLogs = attendanceSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AttendanceLog));
        const allTasks = tasksSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));

        const processedReports: UserReport[] = allUsers.map(user => {
            const userLogs = attendanceLogs.filter(log => log.userId === user.id).sort((a,b) => a.timestamp.toMillis() - b.timestamp.toMillis());
            const userTasks = allTasks.filter(task => task.assigneeId === user.id);
            let workHours = 0;
            let lastCheckIn: Timestamp | null = null;

            userLogs.forEach(log => {
                if (log.type === 'check-in' || log.type === 'break-end') {
                    if (!lastCheckIn) lastCheckIn = log.timestamp;
                } else if (log.type === 'check-out' || log.type === 'break-start') {
                    if (lastCheckIn) {
                        workHours += (log.timestamp.seconds - lastCheckIn.seconds);
                        lastCheckIn = null;
                    }
                }
            });

            const firstCheckIn = userLogs.find(log => log.type === 'check-in')?.timestamp.toDate() || null;
            const lastCheckOut = [...userLogs].reverse().find(log => log.type === 'check-out')?.timestamp.toDate() || null;

            return {
                user: user,
                workHoursToday: workHours,
                checkInTime: firstCheckIn,
                checkOutTime: lastCheckOut,
                assignedTickets: userTasks.length,
                completedTickets: userTasks.filter(t => t.status === 'Done').length
            };
        });
        
        setReportData(processedReports);
        setIsLoading(false);
    };

    generateReport();
  }, [firestore, allUsers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Employee Summary</CardTitle>
        <CardDescription>Performance and attendance metrics for {format(new Date(), 'PPP')}.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Work Hours Today</TableHead>
                  <TableHead>Check-In / Check-Out</TableHead>
                  <TableHead>Tickets (Completed/Total)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.length > 0 ? (
                  reportData.map(({ user, workHoursToday, checkInTime, checkOutTime, assignedTickets, completedTickets }) => {
                      const hoursWorked = workHoursToday / 3600;
                      const isLowHours = checkInTime && hoursWorked < 2;

                      return (
                      <TableRow key={user.id}>
                          <TableCell>
                              <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9">
                                  <AvatarImage src={user.profilePictureUrl} />
                                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <p className="font-medium">{user.name}</p>
                                      <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                              </div>
                          </TableCell>
                          <TableCell className={cn("font-mono", isLowHours && "text-destructive font-bold")}>
                              <div className="flex items-center gap-2">
                                {formatDuration(workHoursToday)}
                                {isLowHours && <AlertCircle className="h-4 w-4" title="Work hours are below the 2-hour minimum." />}
                              </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                              {checkInTime ? format(checkInTime, 'p') : 'N/A'} {' / '} {checkOutTime ? format(checkOutTime, 'p') : 'N/A'}
                          </TableCell>
                          <TableCell>
                             <span className="font-mono">{completedTickets} / {assignedTickets}</span>
                          </TableCell>
                      </TableRow>
                      )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No employee data found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LeaveManagementTab() {
    const firestore = useFirestore();
    const { user: currentUser } = useUser();
    const { toast } = useToast();
    const [isRequestLeaveOpen, setRequestLeaveOpen] = useState(false);
    const [isActionAlertOpen, setActionAlertOpen] = useState(false);
    const [actionRequest, setActionRequest] = useState<{request: LeaveRequest, action: 'Approved' | 'Denied'} | null>(null);
    const [secretCode, setSecretCode] = useState('');
    const [secretCodeError, setSecretCodeError] = useState('');

    const HR_SECRET_CODE = '0012';

    const leaveRequestsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'leaveRequests'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: leaveRequests, isLoading } = useCollection<LeaveRequest>(leaveRequestsCollection);

    const handleActionClick = (request: LeaveRequest, action: 'Approved' | 'Denied') => {
        setActionRequest({ request, action });
        setActionAlertOpen(true);
        setSecretCode('');
        setSecretCodeError('');
    }

    const confirmAction = async () => {
        if (!firestore || !actionRequest || !currentUser) return;
        
        if (secretCode !== HR_SECRET_CODE) {
            setSecretCodeError('Invalid secret code.');
            return;
        }

        const { request, action } = actionRequest;
        const requestRef = doc(firestore, 'leaveRequests', request.id);

        try {
            await updateDoc(requestRef, { status: action });
            
            const notificationPayload = {
                title: `Leave Request ${action}`,
                message: `Your leave request for ${format(request.startDate.toDate(), 'MMM dd')} - ${format(request.endDate.toDate(), 'MMM dd')} has been ${action.toLowerCase()}.`,
                link: '/attendance',
                read: false,
                createdAt: serverTimestamp(),
            };

            const userNotifCollection = collection(firestore, `users/${request.userId}/notifications`);
            addDocumentNonBlocking(userNotifCollection, notificationPayload);

            toast({
                title: `Request ${action}`,
                description: `${request.userName}'s leave request has been ${action.toLowerCase()}.`
            });
        } catch(error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to update leave request status.'
            });
        } finally {
            setActionAlertOpen(false);
            setActionRequest(null);
            setSecretCode('');
            setSecretCodeError('');
        }
    }

    return (
        <>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Leave Management</CardTitle>
                    <CardDescription>Track and manage all employee time off requests.</CardDescription>
                </div>
                <Dialog open={isRequestLeaveOpen} onOpenChange={setRequestLeaveOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" />Request Leave</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Submit a Leave Request</DialogTitle>
                            <DialogDescription>Please fill out the form below to request time off.</DialogDescription>
                        </DialogHeader>
                        <LeaveRequestForm onFinished={() => setRequestLeaveOpen(false)} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>
                ) : (
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveRequests && leaveRequests.length > 0 ? (
                                    leaveRequests.map(request => (
                                        <TableRow key={request.id}>
                                            <TableCell className="font-medium">{request.userName}</TableCell>
                                            <TableCell>{request.leaveType}</TableCell>
                                            <TableCell>{format(request.startDate.toDate(), 'PPP')} - {format(request.endDate.toDate(), 'PPP')}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {request.status === 'Pending' && (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleActionClick(request, 'Approved')}>
                                                            <ThumbsUp className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleActionClick(request, 'Denied')}>
                                                            <ThumbsDown className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No leave requests found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                     </div>
                )}
            </CardContent>
        </Card>
        <AlertDialog open={isActionAlertOpen} onOpenChange={setActionAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Action</AlertDialogTitle>
                    <AlertDialogDescription>
                        You are about to <span className={cn('font-bold', actionRequest?.action === 'Approved' ? 'text-green-500' : 'text-red-500')}>{actionRequest?.action}</span> this request. 
                        Enter the HR secret code to confirm.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                    <div className="relative">
                        <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="password"
                            placeholder="Secret Code"
                            className="pl-8"
                            value={secretCode}
                            onChange={(e) => { setSecretCode(e.target.value); setSecretCodeError(''); }}
                        />
                    </div>
                    {secretCodeError && <p className="text-sm text-destructive">{secretCodeError}</p>}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmAction}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}

function PoliciesTab() {
    const firestore = useFirestore();
    const [isUploadPolicyOpen, setUploadPolicyOpen] = useState(false);
    const { toast } = useToast();

    const policiesCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'policyDocuments'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: policies, isLoading } = useCollection<PolicyDocument>(policiesCollection);
    
    const handleDownload = (policy: PolicyDocument) => {
        // In a real app, this would trigger a download from the fileUrl.
        // For now, it's a placeholder.
        toast({
            title: "Download Initiated (Simulated)",
            description: `Downloading ${policy.fileName}...`,
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Company Policies</CardTitle>
                    <CardDescription>Access and manage all official company documents.</CardDescription>
                </div>
                <Dialog open={isUploadPolicyOpen} onOpenChange={setUploadPolicyOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" />Upload Policy</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload a New Policy</DialogTitle>
                            <DialogDescription>Add a new document to the company policy repository.</DialogDescription>
                        </DialogHeader>
                        <PolicyUploadForm onFinished={() => setUploadPolicyOpen(false)} />
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                 {isLoading ? (
                    <div className="flex justify-center items-center h-96"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>
                ) : (
                     <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Version</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {policies && policies.length > 0 ? (
                                    policies.map(policy => (
                                        <TableRow key={policy.id}>
                                            <TableCell className="font-medium">{policy.title}</TableCell>
                                            <TableCell>{policy.category}</TableCell>
                                            <TableCell>{policy.version}</TableCell>
                                            <TableCell>{format(policy.createdAt.toDate(), 'PPP')}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleDownload(policy)}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">No policy documents found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                     </div>
                )}
            </CardContent>
        </Card>
    );
}

function PayrollTab() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Payroll Management</CardTitle>
                <CardDescription>A centralized place to manage employee salaries, bonuses, and deductions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg">
                    <Banknote className="h-16 w-16 text-muted-foreground" />
                    <h2 className="mt-6 text-xl font-semibold">Payroll Feature Coming Soon</h2>
                    <p className="mt-2 text-center text-muted-foreground">
                        This section is under construction. Soon you'll be able to process payroll, <br/> view payment history, and manage tax information.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function HRPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Human Resources</h1>
        <p className="text-muted-foreground">Completely manage payroll, employee records, leave requests, and company policies.</p>
      </div>
      <Tabs defaultValue="report" className="space-y-4">
        <TabsList>
          <TabsTrigger value="report"><Briefcase className="mr-2 h-4 w-4"/> Employee Report</TabsTrigger>
          <TabsTrigger value="leave"><CalendarDays className="mr-2 h-4 w-4"/> Leave Management</TabsTrigger>
          <TabsTrigger value="policies"><FileText className="mr-2 h-4 w-4"/> Policies</TabsTrigger>
          <TabsTrigger value="payroll"><Banknote className="mr-2 h-4 w-4"/> Payroll</TabsTrigger>
        </TabsList>
        <TabsContent value="report">
          <EmployeeReportTab />
        </TabsContent>
        <TabsContent value="leave">
          <LeaveManagementTab />
        </TabsContent>
        <TabsContent value="policies">
            <PoliciesTab />
        </TabsContent>
        <TabsContent value="payroll">
            <PayrollTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
