import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '../AppSidebar';

export default function AppSidebarExample() {
  const mockRooms = [
    { id: "1", name: "Circle of Belonging", theme: "belonging" as const, memberCount: 12 },
    { id: "2", name: "Dream Weavers", theme: "dreaming" as const, memberCount: 8 },
    { id: "3", name: "Kindness Corner", theme: "kindness" as const, memberCount: 15 },
  ];

  const style = {
    "--sidebar-width": "20rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          currentUserId="user1"
          currentUserName="Alex Chen"
          currentUserRole="admin"
          rooms={mockRooms}
          activeRoomId="1"
          onRoomSelect={(id) => console.log('Room selected:', id)}
          onConstellationClick={() => console.log('Constellation clicked')}
          onModerationClick={() => console.log('Moderation clicked')}
          onSettingsClick={() => console.log('Settings clicked')}
        />
      </div>
    </SidebarProvider>
  );
}
