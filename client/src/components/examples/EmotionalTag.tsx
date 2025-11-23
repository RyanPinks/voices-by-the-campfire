import EmotionalTag from '../EmotionalTag';

export default function EmotionalTagExample() {
  return (
    <div className="flex gap-2 flex-wrap p-4">
      <EmotionalTag emotion="kind" />
      <EmotionalTag emotion="joyful" />
      <EmotionalTag emotion="thoughtful" />
      <EmotionalTag emotion="excited" />
      <EmotionalTag emotion="tense" />
      <EmotionalTag emotion="calm" />
    </div>
  );
}
