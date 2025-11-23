import RoleBadge from '../RoleBadge';

export default function RoleBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap p-4">
      <RoleBadge role="admin" />
      <RoleBadge role="guide" />
      <RoleBadge role="friend" />
      <RoleBadge role="member" />
    </div>
  );
}
