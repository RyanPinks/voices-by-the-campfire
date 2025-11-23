import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import RoleBadge, { type RoleType } from "./RoleBadge";
import EmotionalTag, { type EmotionType } from "./EmotionalTag";
import { Sparkles } from "lucide-react";

interface MessageBubbleProps {
  id: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: RoleType;
  isLumen?: boolean;
  content: string;
  timestamp: string;
  emotionalTags?: EmotionType[];
}

export default function MessageBubble({
  id,
  authorName,
  authorAvatar,
  authorRole,
  isLumen = false,
  content,
  timestamp,
  emotionalTags = [],
}: MessageBubbleProps) {
  return (
    <div className="flex gap-3 py-3" data-testid={`message-${id}`}>
      <Avatar className={`w-10 h-10 ${isLumen ? "ring-2 ring-primary/30" : ""}`}>
        <AvatarImage src={authorAvatar} alt={authorName} />
        <AvatarFallback className={isLumen ? "bg-primary/10 text-primary" : ""}>
          {isLumen ? <Sparkles className="w-5 h-5" /> : authorName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" data-testid={`text-author-${id}`}>
            {authorName}
          </span>
          <RoleBadge role={authorRole} />
          <span className="text-xs text-muted-foreground" data-testid={`text-timestamp-${id}`}>
            {timestamp}
          </span>
        </div>
        
        <p className="text-base leading-relaxed" data-testid={`text-content-${id}`}>
          {content}
        </p>
        
        {emotionalTags.length > 0 && (
          <div className="flex gap-2 flex-wrap pt-1">
            {emotionalTags.map((emotion, index) => (
              <EmotionalTag key={index} emotion={emotion} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
