import RoomCard from '../RoomCard';

export default function RoomCardExample() {
  return (
    <div className="space-y-3 p-4 max-w-sm">
      <RoomCard
        id="1"
        name="Circle of Belonging"
        theme="belonging"
        memberCount={12}
        isActive={true}
        onClick={() => console.log('Room clicked')}
      />
      <RoomCard
        id="2"
        name="Dream Weavers"
        theme="dreaming"
        memberCount={8}
        onClick={() => console.log('Room clicked')}
      />
      <RoomCard
        id="3"
        name="Kindness Corner"
        theme="kindness"
        memberCount={15}
        onClick={() => console.log('Room clicked')}
      />
    </div>
  );
}
