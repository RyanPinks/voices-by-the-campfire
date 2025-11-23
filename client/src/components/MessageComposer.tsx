import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Heart } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmotionalTag, { type EmotionType } from "./EmotionalTag";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";

const emotions: EmotionType[] = ["kind", "joyful", "thoughtful", "excited", "tense", "calm"];

interface MessageComposerProps {
  roomId: string;
  userId: string;
}

export default function MessageComposer({ roomId, userId }: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionType[]>([]);
  const { sendMessage } = useWebSocket({ roomId, userId });

  const toggleEmotion = (emotion: EmotionType) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message, selectedEmotions);
    setMessage("");
    setSelectedEmotions([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t bg-background p-4 space-y-3">
      {selectedEmotions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selectedEmotions.map((emotion) => (
            <Badge
              key={emotion}
              variant="secondary"
              className="cursor-pointer hover-elevate"
              onClick={() => toggleEmotion(emotion)}
              data-testid={`selected-emotion-${emotion}`}
            >
              <EmotionalTag emotion={emotion} />
            </Badge>
          ))}
        </div>
      )}
      
      <div className="flex gap-2 items-end">
        <Textarea
          placeholder="Share your thoughts with kindness..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          rows={1}
          className="resize-none min-h-[2.5rem] max-h-32"
          data-testid="input-message"
        />
        
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" data-testid="button-emotion-picker">
                <Heart className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">Add emotional tone</div>
                <div className="grid grid-cols-2 gap-2">
                  {emotions.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => toggleEmotion(emotion)}
                      className={`text-left p-2 rounded-md hover-elevate active-elevate-2 ${
                        selectedEmotions.includes(emotion) ? "bg-sidebar-accent" : ""
                      }`}
                      data-testid={`button-emotion-${emotion}`}
                    >
                      <EmotionalTag emotion={emotion} />
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button 
            onClick={handleSend}
            disabled={!message.trim()}
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
