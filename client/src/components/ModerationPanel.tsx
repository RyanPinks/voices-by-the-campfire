import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Ban, MessageSquare, Volume2, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FlaggedMessage {
  id: string;
  userName: string;
  userAvatar?: string;
  content: string;
  reason: string;
  timestamp: string;
}

interface ModerationPanelProps {
  flaggedMessages: FlaggedMessage[];
  onWarn?: (messageId: string) => void;
  onMute?: (messageId: string) => void;
  onRemove?: (messageId: string) => void;
}

export default function ModerationPanel({ 
  flaggedMessages, 
  onWarn, 
  onMute, 
  onRemove 
}: ModerationPanelProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h2 className="text-lg font-semibold">Moderation Queue</h2>
        <Badge variant="destructive" className="ml-auto">
          {flaggedMessages.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {flaggedMessages.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            <p>No flagged messages</p>
          </Card>
        ) : (
          flaggedMessages.map((message) => (
            <Card key={message.id} className="p-4 space-y-3" data-testid={`card-flagged-${message.id}`}>
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={message.userAvatar} />
                  <AvatarFallback>{message.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{message.userName}</span>
                    <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                  </div>
                  <p className="text-sm mt-1 line-clamp-2">{message.content}</p>
                  <Badge variant="destructive" className="mt-2 text-xs">
                    {message.reason}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onWarn?.(message.id)}
                  data-testid={`button-warn-${message.id}`}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Warn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMute?.(message.id)}
                  data-testid={`button-mute-${message.id}`}
                >
                  <VolumeX className="w-3 h-3 mr-1" />
                  Mute
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onRemove?.(message.id)}
                  data-testid={`button-remove-${message.id}`}
                >
                  <Ban className="w-3 h-3 mr-1" />
                  Remove
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
