import { Card } from "@/components/ui/card";
import { Users, Sparkles, Heart, Moon, Lightbulb, Mountain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type RoomTheme = "belonging" | "dreaming" | "kindness" | "reflection" | "creativity" | "courage";

const themeConfig: Record<RoomTheme, { icon: typeof Heart; label: string; colorClass: string }> = {
  belonging: { icon: Heart, label: "Belonging", colorClass: "text-pink-500" },
  dreaming: { icon: Moon, label: "Dreaming", colorClass: "text-purple-500" },
  kindness: { icon: Sparkles, label: "Kindness", colorClass: "text-yellow-500" },
  reflection: { icon: Lightbulb, label: "Reflection", colorClass: "text-blue-500" },
  creativity: { icon: Sparkles, label: "Creativity", colorClass: "text-orange-500" },
  courage: { icon: Mountain, label: "Courage", colorClass: "text-green-500" },
};

interface RoomCardProps {
  id: string;
  name: string;
  theme: RoomTheme;
  memberCount: number;
  isActive?: boolean;
  onClick?: () => void;
}

export default function RoomCard({ id, name, theme, memberCount, isActive = false, onClick }: RoomCardProps) {
  const config = themeConfig[theme];
  const Icon = config.icon;

  return (
    <Card
      className={`p-4 cursor-pointer hover-elevate active-elevate-2 transition-all ${
        isActive ? "bg-sidebar-accent border-sidebar-accent-border" : ""
      }`}
      onClick={onClick}
      data-testid={`card-room-${id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-card ${config.colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate" data-testid={`text-room-name-${id}`}>
            {name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span data-testid={`text-member-count-${id}`}>{memberCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
