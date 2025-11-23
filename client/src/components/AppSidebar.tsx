import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Shield, Settings } from "lucide-react";
import RoomCard, { type RoomTheme } from "./RoomCard";
import CreateRoomDialog from "./CreateRoomDialog";
import RoleBadge, { type RoleType } from "./RoleBadge";

interface Room {
  id: string;
  name: string;
  theme: RoomTheme;
  memberCount: number;
}

interface AppSidebarProps {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: RoleType;
  currentUserAvatar?: string;
  rooms: Room[];
  activeRoomId?: string;
  onRoomSelect: (roomId: string) => void;
  onConstellationClick: () => void;
  onModerationClick: () => void;
  onSettingsClick: () => void;
}

export default function AppSidebar({
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
  rooms,
  activeRoomId,
  onRoomSelect,
  onConstellationClick,
  onModerationClick,
  onSettingsClick,
}: AppSidebarProps) {
  const isAdmin = currentUserRole === "admin";

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={currentUserAvatar} alt={currentUserName} />
            <AvatarFallback>{currentUserName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate" data-testid="text-current-user">
              {currentUserName}
            </div>
            <RoleBadge role={currentUserRole} />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold">Rooms</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2 mt-2">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                {...room}
                isActive={room.id === activeRoomId}
                onClick={() => onRoomSelect(room.id)}
              />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <CreateRoomDialog />

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onConstellationClick} data-testid="button-constellation">
                <Star className="w-4 h-4" />
                <span>Friendship Constellation</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onModerationClick} data-testid="button-moderation">
                  <Shield className="w-4 h-4" />
                  <span>Moderation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onSettingsClick} data-testid="button-settings">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
