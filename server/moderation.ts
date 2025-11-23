// Content moderation for child-safe platform
// This blocks inappropriate language and harmful content

// Basic profanity filter - expandable list
const profanityList = new Set([
  "damn", "hell", "crap", "stupid", "idiot", "dumb", "shut up",
  "hate", "kill", "die", "death", "violence", "weapon", "gun",
  // Add more as needed - keeping this child-safe focused
]);

// Harmful patterns
const harmfulPatterns = [
  /\b(kill|hurt|harm|attack)\s+(yourself|myself|themselves)\b/i,
  /\b(hate|don't\s+like)\s+(myself|yourself)\b/i,
  /\b(suicide|suicidal)\b/i,
  /\b(address|phone\s+number|email)\s*:/i, // Personal info sharing
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone numbers
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Emails
];

export interface ModerationResult {
  isClean: boolean;
  reason?: string;
  flaggedTerms?: string[];
}

export function moderateContent(content: string): ModerationResult {
  const lowerContent = content.toLowerCase();
  
  // Check for profanity
  const words = lowerContent.split(/\s+/);
  const flaggedTerms: string[] = [];
  
  for (const word of words) {
    const cleaned = word.replace(/[^a-z]/g, '');
    if (profanityList.has(cleaned)) {
      flaggedTerms.push(word);
    }
  }
  
  if (flaggedTerms.length > 0) {
    return {
      isClean: false,
      reason: "Inappropriate language detected",
      flaggedTerms,
    };
  }
  
  // Check for harmful patterns
  for (const pattern of harmfulPatterns) {
    if (pattern.test(content)) {
      return {
        isClean: false,
        reason: "Potentially harmful content detected",
      };
    }
  }
  
  return { isClean: true };
}

// Enhanced moderation with OpenAI (optional, for more sophisticated filtering)
export async function moderateWithAI(content: string, openaiApiKey?: string): Promise<ModerationResult> {
  // First do basic moderation
  const basicResult = moderateContent(content);
  if (!basicResult.isClean) {
    return basicResult;
  }
  
  // If OpenAI key is available, use their moderation API
  if (openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({ input: content }),
      });
      
      const data = await response.json();
      const result = data.results?.[0];
      
      if (result?.flagged) {
        const categories = Object.entries(result.categories)
          .filter(([_, flagged]) => flagged)
          .map(([category, _]) => category);
        
        return {
          isClean: false,
          reason: `Content flagged for: ${categories.join(', ')}`,
        };
      }
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      // Fall through to basic moderation result
    }
  }
  
  return { isClean: true };
}
