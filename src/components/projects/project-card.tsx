
'use client';

import type { Project } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { Progress } from "../ui/progress";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Trash2 } from "lucide-react";

type ProjectCardProps = {
    project: Project;
    onDelete: (projectId: string) => void;
}

const statusStyles = {
    "Not Started": "bg-gray-500",
    "In Progress": "bg-blue-500",
    "Completed": "bg-green-500",
    "On Hold": "bg-yellow-500",
};

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
    
    const calculateProgress = () => {
        if (project.status === 'Completed') return 100;
        if (project.status === 'Not Started') return 0;

        const totalDuration = project.endDate.toDate().getTime() - project.startDate.toDate().getTime();
        if (totalDuration <= 0) return 0;

        const elapsedDuration = new Date().getTime() - project.startDate.toDate().getTime();
        const progress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
        
        return progress;
    }

    const progress = calculateProgress();
    
    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <Link href={`/projects/${project.slug}`} className="block h-full">
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{project.projectName}</CardTitle>
                                <Badge className={cn("whitespace-nowrap", statusStyles[project.status])}>{project.status}</Badge>
                            </div>
                            <CardDescription>For: {project.clientName}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-3 h-[3.75rem]">{project.description}</p>
                            <div>
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Progress</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} />
                            </div>
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground justify-between">
                            <span>{format(project.startDate.toDate(), 'MMM d, yyyy')} - {format(project.endDate.toDate(), 'MMM d, yyyy')}</span>
                            {project.budget && (
                                <span className="font-semibold">${project.budget.toLocaleString()}</span>
                            )}
                        </CardFooter>
                    </Card>
                </Link>
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem onSelect={() => onDelete(project.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Project
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
