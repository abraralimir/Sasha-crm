import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Mail, Phone, Briefcase, DollarSign, Calendar } from "lucide-react";
import { format, parseISO } from 'date-fns';

const statusColorMap: Record<string, string> = {
    'New': 'bg-blue-500',
    'Contacted': 'bg-yellow-500',
    'Proposal': 'bg-purple-500',
    'Closed': 'bg-green-500',
    'Lost': 'bg-red-500',
}

export function LeadDetails({ lead }: { lead: Lead }) {
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl font-headline">{lead.contactName}</CardTitle>
                        <p className="text-muted-foreground">{lead.companyName}</p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-2">
                        <span className={cn("w-2 h-2 rounded-full", statusColorMap[lead.status] || 'bg-gray-500')}></span>
                        {lead.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <a href={`mailto:${lead.email}`} className="text-sm hover:underline">{lead.email}</a>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <a href={`tel:${lead.phone}`} className="text-sm hover:underline">{lead.phone}</a>
                </div>
                <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.potentialRevenue)} <span className="text-muted-foreground"> (Potential)</span></span>
                </div>
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">Last Contacted: {format(parseISO(lead.lastContacted), "PPP")}</span>
                </div>
                <div className="flex items-center gap-3 md:col-span-2">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{lead.notes}</span>
                </div>
            </CardContent>
        </Card>
    )
}
