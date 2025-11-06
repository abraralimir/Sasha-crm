
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
    title: string;
    value: string;
    change?: string;
    changeType?: 'increase' | 'decrease';
    description?: string;
    icon: React.ReactNode;
};

export function KpiCard({ title, value, change, changeType, description, icon }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && description && changeType && (
            <div className="flex items-center text-xs text-muted-foreground">
            <span
                className={cn(
                "flex items-center gap-1",
                changeType === "increase" ? "text-green-600" : "text-red-600"
                )}
            >
                {changeType === "increase" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {change}
            </span>
            <span className="ml-1">{description}</span>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

