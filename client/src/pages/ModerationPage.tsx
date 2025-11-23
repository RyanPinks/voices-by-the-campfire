import { useState } from "react";
import ModerationPanel from "@/components/ModerationPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ModerationPageProps {
  onBack: () => void;
}

export default function ModerationPage({ onBack }: ModerationPageProps) {
  const [flaggedMessages, setFlaggedMessages] = useState([
    {
      id: "1",
      userName: "TestUser",
      content: "This message was flagged for inappropriate language.",
      reason: "Inappropriate language",
      timestamp: "3:45 PM"
    },
    {
      id: "2",
      userName: "AnotherUser",
      content: "This message triggered the content filter.",
      reason: "Harmful content detected",
      timestamp: "3:50 PM"
    }
  ]);

  const handleWarn = (messageId: string) => {
    console.log('Warning sent for message:', messageId);
  };

  const handleMute = (messageId: string) => {
    console.log('User muted for message:', messageId);
  };

  const handleRemove = (messageId: string) => {
    setFlaggedMessages(prev => prev.filter(msg => msg.id !== messageId));
    console.log('Message removed:', messageId);
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back-moderation">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Review flagged content and take gentle action
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <ModerationPanel
          flaggedMessages={flaggedMessages}
          onWarn={handleWarn}
          onMute={handleMute}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
}
