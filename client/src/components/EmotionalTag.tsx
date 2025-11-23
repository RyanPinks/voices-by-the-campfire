import { Badge } from "@/components/ui/badge";
import { Heart, Zap, Smile, MessageSquareDashed as Brain, Sparkles, Cloud } from "lucide-react";

export type EmotionType = "kind" | "tense" | "joyful" | "thoughtful" | "excited" | "calm";

const emotionConfig: Record<EmotionType, { icon: typeof Heart; label: string; colorClass: string }> = {
  kind: { icon: Heart, label: "Kind", colorClass: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300" },
  tense: { icon: Zap, label: "Tense", colorClass: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
  joyful: { icon: Smile, label: "Joyful", colorClass: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" },
  thoughtful: { icon: Brain, label: "Thoughtful", colorClass: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  excited: { icon: Sparkles, label: "Excited", colorClass: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  calm: { icon: Cloud, label: "Calm", colorClass: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
};

interface EmotionalTagProps {
  emotion: EmotionType;
  size?: "sm" | "default";
}

export default function EmotionalTag({ emotion, size = "sm" }: EmotionalTagProps) {
  const config = emotionConfig[emotion];
  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary" 
      className={`${config.colorClass} rounded-full gap-1 ${size === "sm" ? "text-xs px-2 py-0.5" : "px-3 py-1"}`}
      data-testid={`tag-emotion-${emotion}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      <span>{config.label}</span>
    </Badge>
  );
}
