import { Badge } from "@/components/ui/badge";
import { Star, Compass, Heart, User } from "lucide-react";

export type RoleType = "admin" | "guide" | "friend" | "member";

const roleConfig: Record<RoleType, { icon: typeof Star; label: string; colorClass: string }> = {
  admin: { icon: Star, label: "Admin", colorClass: "bg-primary text-primary-foreground" },
  guide: { icon: Compass, label: "Guide", colorClass: "bg-purple-500 text-white dark:bg-purple-600" },
  friend: { icon: Heart, label: "Friend", colorClass: "bg-pink-500 text-white dark:bg-pink-600" },
  member: { icon: User, label: "Member", colorClass: "bg-muted text-muted-foreground" },
};

interface RoleBadgeProps {
  role: RoleType;
  size?: "sm" | "default";
}

export default function RoleBadge({ role, size = "sm" }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge 
      className={`${config.colorClass} rounded-full gap-1 ${size === "sm" ? "text-xs px-2 py-0.5" : "px-3 py-1"}`}
      data-testid={`badge-role-${role}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      <span>{config.label}</span>
    </Badge>
  );
}
