import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { leads } from "@/lib/data"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "../ui/button"

const statusVariantMap: Record<string, "default" | "secondary" | "destructive"> = {
  'New': 'secondary',
  'Contacted': 'default',
  'Proposal': 'default',
  'Closed': 'secondary',
  'Lost': 'destructive',
};

const statusColorMap: Record<string, string> = {
    'New': 'bg-blue-500',
    'Contacted': 'bg-yellow-500',
    'Proposal': 'bg-purple-500',
    'Closed': 'bg-green-500',
    'Lost': 'bg-red-500',
}


export function LeadsTable() {
  const recentLeads = leads.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leads</CardTitle>
        <CardDescription>
          A list of the most recent leads from Sasha Consulting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Potential Revenue</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src={lead.avatar} alt="Avatar" />
                      <AvatarFallback>{lead.contactName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {lead.contactName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lead.companyName}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge className="text-xs" variant={statusVariantMap[lead.status] || 'default'}>
                    <span className={cn("w-2 h-2 mr-2 rounded-full", statusColorMap[lead.status] || 'bg-gray-500')}></span>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(lead.potentialRevenue)}
                </TableCell>
                <TableCell className="text-right">
                    <Link href={`/leads/${lead.id}`}>
                        <Button size="sm" variant="outline">View</Button>
                    </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
