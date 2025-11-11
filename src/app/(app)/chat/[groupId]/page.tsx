
import { GroupChat } from "@/components/chat/group-chat";

export default function ChatPage({ params }: { params: { groupId: string } }) {
  return (
    <div className="h-full">
      <GroupChat groupId={params.groupId} />
    </div>
  );
}
