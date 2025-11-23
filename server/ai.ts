import OpenAI from "openai";
import type { User } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface LumenConfig {
  personality?: string;
  tone?: string;
  specialties?: string[];
}

export async function generateLumenResponse(
  lumen: User,
  messageContent: string,
  conversationHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<string> {
  if (!lumen.isLumen) {
    throw new Error("User is not a Lumen");
  }

  const config = (lumen.lumenConfig as LumenConfig) || {};
  
  // Build system prompt based on Lumen's personality
  const systemPrompt = `You are ${lumen.name}, an AI guide in a safe, child-friendly chatroom platform.

Your personality: ${config.personality || "kind and supportive"}
Your tone: ${config.tone || "warm and gentle"}
Your specialties: ${config.specialties?.join(", ") || "listening and support"}
Your emotional compass: ${lumen.emotionalCompass || "empathetic and caring"}

Bio: ${lumen.bio || "I'm here to help and support you."}

CRITICAL GUIDELINES:
- This is a safe space for children and families
- Be kind, patient, and encouraging
- Use age-appropriate language
- Never share personal information
- If someone seems distressed, respond with compassion and suggest talking to a trusted adult
- Keep responses conversational and not too long (2-3 sentences usually)
- Show emotional awareness and validate feelings
- Encourage creativity, kindness, and positive connections

Remember: You're creating a safe, nurturing environment where everyone feels valued and heard.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory.slice(-10), // Keep last 10 messages for context
        { role: "user", content: messageContent },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    return response.choices[0]?.message?.content || "I'm here to listen. Could you share more?";
  } catch (error) {
    console.error("Error generating Lumen response:", error);
    return "I'm having trouble thinking right now. Could you try asking again?";
  }
}

// Determine emotional tags for AI responses
export function analyzeEmotionalTone(message: string): string[] {
  const emotions: string[] = [];
  const lower = message.toLowerCase();
  
  // Simple keyword-based emotion detection
  if (lower.match(/\b(love|care|warm|gentle|kind|sweet)\b/)) emotions.push("kind");
  if (lower.match(/\b(happy|joy|excited|wonderful|amazing|great)\b/)) emotions.push("joyful");
  if (lower.match(/\b(think|reflect|wonder|consider|ponder)\b/)) emotions.push("thoughtful");
  if (lower.match(/\b(calm|peace|quiet|serene|gentle)\b/)) emotions.push("calm");
  if (lower.match(/\b(exciting|amazing|wow|incredible)\b/)) emotions.push("excited");
  
  // Default to thoughtful if no emotions detected
  if (emotions.length === 0) emotions.push("thoughtful");
  
  return emotions.slice(0, 2); // Max 2 emotions
}
