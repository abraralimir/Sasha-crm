
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { UserStatus, AttendanceLog, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, LogOut, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { usePresence } from '@/hooks/use-presence';

const getInitials = (name?: string | null) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const formatDuration = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function AttendancePage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { startBreak, endBreak, manualCheckout } = usePresence();

  const userStatusCollection = useMemoFirebase(() => {
    return firestore ? collection(firestore, 'userStatus') : null;
  }, [firestore]);
  const { data: userStatuses, isLoading: statusesLoading } = useCollection<UserStatus>(userStatusCollection);

  const [dailyLogs, setDailyLogs] = useState<Record<string, AttendanceLog[]>>({});
  const [activeTimers, setActiveTimers] = useState<Record<string, number>>({});
  
  const todayStart = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(now);
  }, []);

  const attendanceQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'attendance'), where('timestamp', '>=', todayStart), orderBy('timestamp', 'asc'));
  }, [firestore, todayStart]);
  
  const { data: rawLogs, isLoading: logsLoading } = useCollection<AttendanceLog>(attendanceQuery);

  useEffect(() => {
    if (!rawLogs) return;

    const logsByUId: Record<string, AttendanceLog[]> = {};
    rawLogs.forEach(log => {
      if (!logsByUId[log.userId]) {
        logsByUId[log.userId] = [];
      }
      logsByUId[log.userId].push(log);
    });

    const timers: Record<string, number> = {};
    Object.keys(logsByUId).forEach(userId => {
      const userLogs = logsByUId[userId];
      let totalSeconds = 0;
      let lastCheckIn: Timestamp | null = null;
      let onBreak = false;

      userLogs.forEach(log => {
        switch (log.type) {
          case 'check-in':
          case 'break-end':
            if (!onBreak) lastCheckIn = log.timestamp;
            onBreak = false;
            break;
          case 'check-out':
          case 'break-start':
            if (lastCheckIn && !onBreak) {
              totalSeconds += (log.timestamp.seconds - lastCheckIn.seconds);
            }
            lastCheckIn = null;
            if(log.type === 'break-start') onBreak = true;
            break;
        }
      });
      
      timers[userId] = totalSeconds;
    });
    
    setDailyLogs(logsByUId);
    setActiveTimers(timers);

  }, [rawLogs]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => {
        const newTimers = { ...prev };
        userStatuses?.forEach(status => {
          if (status.status === 'active' && newTimers[status.id] !== undefined) {
            newTimers[status.id]++;
          }
        });
        return newTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [userStatuses]);

  const isLoading = statusesLoading || logsLoading;
  const currentUserStatus = userStatuses?.find(s => s.id === currentUser?.uid);
  const currentUserActiveTime = activeTimers[currentUser?.uid || ''] || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Attendance</h1>
          <p className="text-muted-foreground">Real-time overview of your team's activity today.</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Session</CardTitle>
          <CardDescription>Your current work session details and controls.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Timer className="h-8 w-8 text-primary"/>
            <div>
              <p className="text-muted-foreground">Today's Active Time</p>
              <p className="text-2xl font-bold font-mono">{formatDuration(currentUserActiveTime)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={currentUserStatus?.status === 'on-break' ? endBreak : startBreak}
              disabled={currentUserStatus?.status === 'offline' || !currentUserStatus}
            >
              {currentUserStatus?.status === 'on-break' ? <Play className="mr-2"/> : <Pause className="mr-2" />}
              {currentUserStatus?.status === 'on-break' ? 'End Break' : 'Start Break'}
            </Button>
            <Button variant="destructive" onClick={manualCheckout} disabled={currentUserStatus?.status === 'offline'}>
              <LogOut className="mr-2"/>
              Check Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Status</CardTitle>
          <CardDescription>Live status of all team members.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Today's Active Time</TableHead>
                    <TableHead>Last Seen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStatuses && userStatuses.length > 0 ? (
                    userStatuses.map((status) => (
                      <TableRow key={status.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={status.userAvatar} />
                              <AvatarFallback>{getInitials(status.userName)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{status.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                                <span className={cn(
                                    "h-3 w-3 rounded-full animate-pulse",
                                    { 'bg-green-500': status.status === 'active' },
                                    { 'bg-yellow-500': status.status === 'away' || status.status === 'on-break' },
                                    { 'bg-red-500 animate-none': status.status === 'offline' }
                                )}></span>
                                <span className="capitalize">{status.status.replace('-', ' ')}</span>
                           </div>
                        </TableCell>
                        <TableCell className="font-mono">{formatDuration(activeTimers[status.id] || 0)}</TableCell>
                        <TableCell>{status.lastSeen ? formatDistanceToNow(status.lastSeen.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">No team members found.</TableCell>
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
