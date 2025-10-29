'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

export default function ConferencePage() {

    return (
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-muted rounded-full p-3 w-fit">
                        <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">Video Conferencing</CardTitle>
                    <CardDescription>This feature is currently under construction.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-sm text-muted-foreground">
                        The video conferencing feature has been temporarily disabled to resolve a system issue. We are working to bring it back online soon.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
