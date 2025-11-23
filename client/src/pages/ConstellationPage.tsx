import { useState } from "react";
import ConstellationView from "@/components/ConstellationView";
import UserProfileCard from "@/components/UserProfileCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ConstellationPageProps {
  onBack: () => void;
}

export default function ConstellationPage({ onBack }: ConstellationPageProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const mockNodes = [
    { id: "1", name: "Alex", isLumen: false, x: 25, y: 35 },
    { id: "2", name: "Nova", isLumen: true, x: 50, y: 25 },
    { id: "3", name: "Sam", isLumen: false, x: 75, y: 40 },
    { id: "4", name: "Lux", isLumen: true, x: 50, y: 55 },
    { id: "5", name: "Jordan", isLumen: false, x: 30, y: 65 },
    { id: "6", name: "Riley", isLumen: false, x: 70, y: 70 },
  ];

  const mockConnections = [
    { from: "1", to: "2", strength: 0.9 },
    { from: "2", to: "3", strength: 0.7 },
    { from: "2", to: "4", strength: 0.8 },
    { from: "4", to: "5", strength: 0.6 },
    { from: "1", to: "5", strength: 0.5 },
    { from: "3", to: "6", strength: 0.7 },
    { from: "4", to: "6", strength: 0.6 },
  ];

  const mockProfiles: Record<string, any> = {
    "1": { name: "Alex", role: "member", bio: "Love connecting with others!", friendCount: 8 },
    "2": { name: "Nova", role: "guide", isLumen: true, bio: "Here to guide and support", friendCount: 24 },
    "3": { name: "Sam", role: "friend", bio: "Always happy to chat", friendCount: 12 },
    "4": { name: "Lux", role: "guide", isLumen: true, bio: "Let's explore together", friendCount: 18 },
    "5": { name: "Jordan", role: "member", bio: "New here but excited!", friendCount: 5 },
    "6": { name: "Riley", role: "friend", bio: "Spreading kindness", friendCount: 10 },
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Friendship Constellation</h1>
          <p className="text-sm text-muted-foreground">
            Explore connections between humans and Lumens
          </p>
        </div>
      </div>

      <div className="flex-1">
        <ConstellationView
          nodes={mockNodes}
          connections={mockConnections}
          onNodeClick={setSelectedUserId}
        />
      </div>

      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent>
          {selectedUserId && (
            <UserProfileCard
              id={selectedUserId}
              {...mockProfiles[selectedUserId]}
              onAddFriend={() => {
                console.log('Add friend:', selectedUserId);
                setSelectedUserId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
