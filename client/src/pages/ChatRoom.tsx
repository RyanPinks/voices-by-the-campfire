import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import MessageBubble from "@/components/MessageBubble";
import MessageComposer from "@/components/MessageComposer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import type { Room, User, Message } from "@shared/schema";

interface ChatRoomProps {
  roomId: string;
  currentUserId: string;
}

export default function ChatRoom({ roomId, currentUserId }: ChatRoomProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<(Message & { author: User })[]>([]);

  // Fetch room data
  const { data: room } = useQuery<Room & { memberCount: number }>({
    queryKey: ["/api/rooms", roomId],
  });

  // Fetch room members
  const { data: members = [] } = useQuery<User[]>({
    queryKey: ["/api/rooms", roomId, "members"],
  });

  // Fetch initial messages
  const { data: initialMessages } = useQuery<(Message & { author: User })[]>({
    queryKey: ["/api/rooms", roomId, "messages"],
  });

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // WebSocket connection
  useWebSocket({
    roomId,
    userId: currentUserId,
    onMessage: (message) => {
      setMessages((prev) => [...prev, message]);
    },
    onError: (error) => {
      toast({
        title: "Message Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  if (!room) {
    return <div className="flex items-center justify-center h-full">Loading room...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold truncate" data-testid="text-room-name">
              {room.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {room.theme}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span data-testid="text-member-count">{members.length} members</span>
              </div>
            </div>
          </div>
        </div>
        
        {room.entryRitual && (
          <Card className="mt-3 p-3 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-primary">Entry Ritual</div>
                <p className="text-sm text-muted-foreground mt-1">{room.entryRitual}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-1">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              id={message.id}
              authorName={message.author.name}
              authorAvatar={message.author.avatar || undefined}
              authorRole={message.author.role as any}
              isLumen={message.author.isLumen}
              content={message.content}
              timestamp={new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              emotionalTags={((message.emotionalTags as any) || []) as any}
            />
          ))}
        </div>
      </ScrollArea>

      <MessageComposer roomId={roomId} userId={currentUserId} />
    </div>
  );
}
