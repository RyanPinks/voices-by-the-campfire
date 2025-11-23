import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Heart, Moon, Sparkles, Lightbulb, Mountain } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { RoomTheme } from "./RoomCard";

const themeOptions: { value: RoomTheme; icon: typeof Heart; label: string; description: string }[] = [
  { value: "belonging", icon: Heart, label: "Belonging", description: "Finding your place" },
  { value: "dreaming", icon: Moon, label: "Dreaming", description: "Imagination & hopes" },
  { value: "kindness", icon: Sparkles, label: "Kindness", description: "Spreading warmth" },
  { value: "reflection", icon: Lightbulb, label: "Reflection", description: "Thoughtful moments" },
  { value: "creativity", icon: Sparkles, label: "Creativity", description: "Express yourself" },
  { value: "courage", icon: Mountain, label: "Courage", description: "Being brave" },
];

export default function CreateRoomDialog() {
  const [open, setOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<RoomTheme>("belonging");
  const [entryRitual, setEntryRitual] = useState("");

  const handleCreate = () => {
    console.log("Creating room:", { roomName, selectedTheme, entryRitual });
    setOpen(false);
    setRoomName("");
    setEntryRitual("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-full" data-testid="button-create-room">
          <Plus className="w-4 h-4 mr-2" />
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create a New Room</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="Enter a welcoming name..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              data-testid="input-room-name"
            />
          </div>

          <div className="space-y-3">
            <Label>Choose a Theme</Label>
            <div className="grid grid-cols-2 gap-3">
              {themeOptions.map((theme) => {
                const Icon = theme.icon;
                return (
                  <Card
                    key={theme.value}
                    className={`p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
                      selectedTheme === theme.value ? "bg-sidebar-accent border-primary" : ""
                    }`}
                    onClick={() => setSelectedTheme(theme.value)}
                    data-testid={`card-theme-${theme.value}`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-semibold text-sm">{theme.label}</div>
                        <div className="text-xs text-muted-foreground">{theme.description}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entry-ritual">Entry Ritual (Optional)</Label>
            <Textarea
              id="entry-ritual"
              placeholder="A welcoming message or question for newcomers..."
              value={entryRitual}
              onChange={(e) => setEntryRitual(e.target.value)}
              rows={3}
              data-testid="input-entry-ritual"
            />
          </div>

          <Button 
            className="w-full rounded-full" 
            size="lg"
            onClick={handleCreate}
            disabled={!roomName.trim()}
            data-testid="button-submit-create-room"
          >
            Create Room
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
