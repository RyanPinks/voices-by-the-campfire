import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import ChatRoom from "@/pages/ChatRoom";
import ConstellationPage from "@/pages/ConstellationPage";
import ModerationPage from "@/pages/ModerationPage";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Room } from "@shared/schema";

type View = "chat" | "constellation" | "moderation";

function MainApp() {
  const [currentView, setCurrentView] = useState<View>("chat");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const { user, isLoading } = useCurrentUser();

  // Fetch all rooms
  const { data: rooms = [] } = useQuery<(Room & { memberCount: number })[]>({
    queryKey: ["/api/rooms"],
  });

  // Auto-select first room if none selected
  if (!activeRoomId && rooms.length > 0) {
    setActiveRoomId(rooms[0].id);
  }

  const sidebarStyle = {
    "--sidebar-width": "20rem",
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading Lumen...</div>
          <div className="text-sm text-muted-foreground mt-2">Creating your safe space</div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserRole={user.role as any}
          currentUserAvatar={user.avatar || undefined}
          rooms={rooms.map(r => ({
            id: r.id,
            name: r.name,
            theme: r.theme as any,
            memberCount: r.memberCount,
          }))}
          activeRoomId={activeRoomId || undefined}
          onRoomSelect={(roomId) => {
            setActiveRoomId(roomId);
            setCurrentView("chat");
          }}
          onConstellationClick={() => setCurrentView("constellation")}
          onModerationClick={() => setCurrentView("moderation")}
          onSettingsClick={() => console.log('Settings clicked')}
        />
        
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          
          <main className="flex-1 overflow-hidden">
            {currentView === "chat" && activeRoomId && (
              <ChatRoom roomId={activeRoomId} currentUserId={user.id} />
            )}
            
            {currentView === "constellation" && (
              <ConstellationPage onBack={() => setCurrentView("chat")} />
            )}
            
            {currentView === "moderation" && (
              <ModerationPage onBack={() => setCurrentView("chat")} />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MainApp />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
