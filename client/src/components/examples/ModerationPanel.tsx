import ModerationPanel from '../ModerationPanel';

export default function ModerationPanelExample() {
  const mockMessages = [
    {
      id: "1",
      userName: "User123",
      content: "This message contains inappropriate language that was flagged by the system.",
      reason: "Inappropriate language",
      timestamp: "3:45 PM"
    },
    {
      id: "2",
      userName: "AnotherUser",
      content: "This message was flagged for potentially harmful content.",
      reason: "Harmful content detected",
      timestamp: "3:50 PM"
    }
  ];

  return (
    <div className="max-w-2xl">
      <ModerationPanel
        flaggedMessages={mockMessages}
        onWarn={(id) => console.log('Warn:', id)}
        onMute={(id) => console.log('Mute:', id)}
        onRemove={(id) => console.log('Remove:', id)}
      />
    </div>
  );
}
