'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp, getDocs } from 'firebase/firestore';
import type { UserProfile, AttendanceLog, Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfDay, endOfDay } from 'date-fns';

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

export default function HRPage() {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">HR Employee Report</h1>
        <p className="text-muted-foreground">A comprehensive daily overview of team productivity and attendance.</p>
      </div>

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
                        const isLowHours = hoursWorked > 0 && hoursWorked < 2;

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
                                  {isLowHours && <AlertCircle className="h-4 w-4" />}
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
    </div>
  );
}
