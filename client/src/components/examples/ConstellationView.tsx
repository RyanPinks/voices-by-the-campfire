import ConstellationView from '../ConstellationView';

export default function ConstellationViewExample() {
  const mockNodes = [
    { id: "1", name: "Alex", isLumen: false, x: 30, y: 40 },
    { id: "2", name: "Nova", isLumen: true, x: 50, y: 30 },
    { id: "3", name: "Sam", isLumen: false, x: 70, y: 45 },
    { id: "4", name: "Lux", isLumen: true, x: 50, y: 60 },
    { id: "5", name: "Jordan", isLumen: false, x: 35, y: 70 },
  ];

  const mockConnections = [
    { from: "1", to: "2", strength: 0.8 },
    { from: "2", to: "3", strength: 0.6 },
    { from: "2", to: "4", strength: 0.9 },
    { from: "4", to: "5", strength: 0.7 },
    { from: "1", to: "5", strength: 0.5 },
  ];

  return (
    <div className="w-full h-[500px] p-4">
      <ConstellationView
        nodes={mockNodes}
        connections={mockConnections}
        onNodeClick={(id) => console.log('Node clicked:', id)}
      />
    </div>
  );
}
