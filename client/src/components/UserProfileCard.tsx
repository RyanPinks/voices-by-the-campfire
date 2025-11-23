import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import RoleBadge, { type RoleType } from "./RoleBadge";
import { Button } from "@/components/ui/button";
import { UserPlus, Sparkles, Star } from "lucide-react";

interface UserProfileCardProps {
  id: string;
  name: string;
  avatar?: string;
  role: RoleType;
  isLumen?: boolean;
  bio?: string;
  friendCount?: number;
  emotionalCompass?: string;
  isFriend?: boolean;
  onAddFriend?: () => void;
}

export default function UserProfileCard({
  id,
  name,
  avatar,
  role,
  isLumen = false,
  bio,
  friendCount = 0,
  emotionalCompass = "Warm and welcoming",
  isFriend = false,
  onAddFriend,
}: UserProfileCardProps) {
  return (
    <Card className="p-6 space-y-4" data-testid={`card-profile-${id}`}>
      <div className="flex flex-col items-center text-center gap-4">
        <Avatar className={`w-32 h-32 ${isLumen ? "ring-4 ring-primary/30" : ""}`}>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className={isLumen ? "bg-primary/10 text-primary text-2xl" : "text-2xl"}>
            {isLumen ? <Sparkles className="w-12 h-12" /> : name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold" data-testid={`text-profile-name-${id}`}>
            {name}
          </h2>
          <RoleBadge role={role} size="default" />
        </div>
      </div>

      {bio && (
        <p className="text-sm text-muted-foreground text-center" data-testid={`text-bio-${id}`}>
          {bio}
        </p>
      )}

      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="font-medium" data-testid={`text-friend-count-${id}`}>
            {friendCount} friends
          </span>
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <div className="text-xs text-muted-foreground text-center">
          Emotional Compass
        </div>
        <div className="text-sm text-center font-medium" data-testid={`text-compass-${id}`}>
          {emotionalCompass}
        </div>
      </div>

      {!isFriend && onAddFriend && (
        <Button 
          className="w-full" 
          variant="default"
          onClick={onAddFriend}
          data-testid={`button-add-friend-${id}`}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend
        </Button>
      )}
    </Card>
  );
}
