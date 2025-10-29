import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAvatars } from "@/lib/data";

const activities = [
  {
    id: 1,
    author: 'Alice Johnson',
    avatarId: 'avatar-1',
    action: 'created the lead.',
    timestamp: '3 days ago',
  },
  {
    id: 2,
    author: 'Sasha AI',
    avatarId: 'ai',
    action: 'generated an initial ROI prediction.',
    timestamp: '3 days ago',
  },
  {
    id: 3,
    author: 'Bob Williams',
    avatarId: 'avatar-2',
    action: 'sent a follow-up email.',
    timestamp: '2 days ago',
  },
  {
    id: 4,
    author: 'Alice Johnson',
    avatarId: 'avatar-1',
    action: 'uploaded a new document: "Project Proposal v1.pdf"',
    timestamp: '1 day ago',
  },
  {
    id: 5,
    author: 'Sasha AI',
    avatarId: 'ai',
    action: 'analyzed the risk factors for the proposal.',
    timestamp: '1 day ago',
  },
];

export function ActivityFeed() {
  const avatars = getAvatars();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Collaboration Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              <div className="relative">
                <Avatar>
                  {activity.avatarId === 'ai' ? (
                     <AvatarFallback>AI</AvatarFallback>
                  ) : (
                    <>
                    <AvatarImage src={avatars[activity.avatarId]} />
                    <AvatarFallback>{activity.author.charAt(0)}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                {index < activities.length - 1 && (
                    <div className="absolute left-1/2 top-10 h-full w-px -translate-x-1/2 bg-border" />
                )}
              </div>
              <div className="flex-1 space-y-1 pt-1">
                <p className="text-sm">
                  <span className="font-semibold">{activity.author}</span> {activity.action}
                </p>
                <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
