import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface ConstellationNode {
  id: string;
  name: string;
  avatar?: string;
  isLumen: boolean;
  x: number;
  y: number;
}

interface ConstellationConnection {
  from: string;
  to: string;
  strength: number;
}

interface ConstellationViewProps {
  nodes: ConstellationNode[];
  connections: ConstellationConnection[];
  onNodeClick?: (nodeId: string) => void;
}

export default function ConstellationView({ nodes, connections, onNodeClick }: ConstellationViewProps) {
  return (
    <Card className="w-full h-full min-h-[400px] p-6 bg-gradient-to-br from-background to-card relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="connectionGlow">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        
        {connections.map((conn, index) => {
          const fromNode = nodes.find((n) => n.id === conn.from);
          const toNode = nodes.find((n) => n.id === conn.to);
          if (!fromNode || !toNode) return null;

          return (
            <g key={index}>
              <line
                x1={`${fromNode.x}%`}
                y1={`${fromNode.y}%`}
                x2={`${toNode.x}%`}
                y2={`${toNode.y}%`}
                stroke="url(#connectionGlow)"
                strokeWidth={conn.strength * 3}
                className="transition-all duration-300"
              />
            </g>
          );
        })}
      </svg>

      {nodes.map((node) => (
        <div
          key={node.id}
          className="absolute transition-all duration-300 cursor-pointer hover-elevate"
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          onClick={() => onNodeClick?.(node.id)}
          data-testid={`node-${node.id}`}
        >
          <div className="flex flex-col items-center gap-1">
            <Avatar className={`w-12 h-12 ${node.isLumen ? "ring-2 ring-primary/50" : ""}`}>
              <AvatarImage src={node.avatar} alt={node.name} />
              <AvatarFallback className={node.isLumen ? "bg-primary/10 text-primary" : ""}>
                {node.isLumen ? <Sparkles className="w-5 h-5" /> : node.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-medium bg-background/80 px-2 py-0.5 rounded-full">
              {node.name}
            </span>
          </div>
        </div>
      ))}
    </Card>
  );
}
