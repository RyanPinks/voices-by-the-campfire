import UserProfileCard from '../UserProfileCard';

export default function UserProfileCardExample() {
  return (
    <div className="grid gap-4 p-4 md:grid-cols-2 max-w-4xl">
      <UserProfileCard
        id="1"
        name="Alex Chen"
        role="member"
        bio="I love connecting with others and sharing stories!"
        friendCount={12}
        emotionalCompass="Curious and empathetic"
        isFriend={false}
        onAddFriend={() => console.log('Add friend clicked')}
      />
      <UserProfileCard
        id="2"
        name="Nova"
        role="guide"
        isLumen={true}
        bio="I'm here to listen, support, and help you explore your thoughts and feelings."
        friendCount={45}
        emotionalCompass="Warm and welcoming"
        isFriend={false}
        onAddFriend={() => console.log('Add friend clicked')}
      />
    </div>
  );
}
