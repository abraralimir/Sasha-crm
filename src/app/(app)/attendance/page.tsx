
'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { useFirestore, useCollection, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import type { UserStatus, AttendanceLog, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Pause, LogOut, Timer, IndianRupee, ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
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

const IST_TIME_ZONE = 'Asia/Kolkata';

const LiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div>
            <p className="text-2xl font-bold font-mono">
                {time.toLocaleTimeString('en-US', { timeZone: IST_TIME_ZONE, hour12: true })}
            </p>
            <p className="text-sm text-muted-foreground">
                {time.toLocaleDateString('en-GB', { timeZone: IST_TIME_ZONE, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
        </div>
    )
}

export default function AttendancePage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { startBreak, endBreak, manualCheckout } = usePresence();
  
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // 1. Fetch all users
  const allUsersCollection = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
  const { data: allUsers, isLoading: usersLoading } = useCollection<UserProfile>(allUsersCollection);

  // 2. Fetch all user statuses
  const userStatusCollection = useMemoFirebase(() => {
    return firestore ? collection(firestore, 'userStatus') : null;
  }, [firestore]);
  const { data: userStatuses, isLoading: statusesLoading } = useCollection<UserStatus>(userStatusCollection);

  // 3. Fetch today's attendance logs
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
  
  const toggleRow = (userId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const isLoading = statusesLoading || logsLoading || usersLoading;
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
      
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
            <CardHeader>
                <CardTitle>My Session</CardTitle>
                <CardDescription>Your current work session details and controls.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Timer className="h-8 w-8 text-primary"/>
                    <div>
                    <p className="text-muted-foreground">Today's Active Time</p>
                    <p className="text-2xl font-bold font-mono">{formatDuration(currentUserActiveTime)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
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
                <CardTitle>Current Time (IST)</CardTitle>
                <CardDescription>Live time based on Indian Standard Time.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Clock className="h-8 w-8 text-primary"/>
                <LiveClock />
            </CardContent>
        </Card>
       </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Status</CardTitle>
          <CardDescription>Live status and daily logs for all team members.</CardDescription>
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
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers && allUsers.length > 0 ? (
                    allUsers.map((user) => {
                      const status = userStatuses?.find(s => s.id === user.id);
                      const userDailyLogs = dailyLogs[user.id] || [];
                      return (
                        <Fragment key={user.id}>
                          <TableRow onClick={() => toggleRow(user.id)} className="cursor-pointer">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarImage src={user.profilePictureUrl} />
                                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{user.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "h-3 w-3 rounded-full",
                                        { 'bg-green-500 animate-pulse': status?.status === 'active' },
                                        { 'bg-yellow-500 animate-pulse': status?.status === 'away' || status?.status === 'on-break' },
                                        { 'bg-red-500': !status || status?.status === 'offline' }
                                    )}></span>
                                    <span className="capitalize">{status ? status.status.replace('-', ' ') : 'Offline'}</span>
                               </div>
                            </TableCell>
                            <TableCell className="font-mono">{formatDuration(activeTimers[user.id] || 0)}</TableCell>
                            <TableCell>{status?.lastSeen ? formatDistanceToNow(status.lastSeen.toDate(), { addSuffix: true }) : 'N/A'}</TableCell>
                            <TableCell>
                                <Button variant="ghost" size="icon">
                                    {expandedRows.has(user.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                            </TableCell>
                          </TableRow>
                          {expandedRows.has(user.id) && (
                            <TableRow>
                                <TableCell colSpan={5} className="p-0">
                                    <div className="p-4 bg-muted/50">
                                        <h4 className="font-semibold mb-2">Today's Log for {user.name}</h4>
                                        {userDailyLogs.length > 0 ? (
                                             <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Event</TableHead>
                                                        <TableHead>Time</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {userDailyLogs.map(log => (
                                                        <TableRow key={log.id}>
                                                            <TableCell className='capitalize'>{log.type.replace('-', ' ')}</TableCell>
                                                            <TableCell>{format(log.timestamp.toDate(), 'p')}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                             </Table>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No activity recorded today.</p>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">No team members found.</TableCell>
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
