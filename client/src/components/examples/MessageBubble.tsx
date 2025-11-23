import MessageBubble from '../MessageBubble';

export default function MessageBubbleExample() {
  return (
    <div className="space-y-1 p-4 max-w-2xl">
      <MessageBubble
        id="1"
        authorName="Alex"
        authorRole="member"
        content="I'm so excited to be here! This space feels really welcoming."
        timestamp="2:45 PM"
        emotionalTags={["excited", "joyful"]}
      />
      <MessageBubble
        id="2"
        authorName="Nova"
        authorRole="guide"
        isLumen={true}
        content="Welcome, Alex! I'm glad you feel that way. What brings you to our space today?"
        timestamp="2:46 PM"
        emotionalTags={["kind", "thoughtful"]}
      />
    </div>
  );
}
