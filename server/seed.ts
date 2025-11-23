import { storage } from "./storage";

export async function seedDatabase() {
  console.log("Seeding database...");

  try {
    // Check if already seeded
    const existingUsers = await storage.getAllUsers();
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    // Create AI Lumens with personalities
    const nova = await storage.createUser({
      name: "Nova",
      isLumen: true,
      role: "guide",
      bio: "I'm here to listen, support, and help you explore your thoughts and feelings with warmth and understanding.",
      emotionalCompass: "Warm and welcoming, patient listener",
      lumenConfig: {
        personality: "empathetic guide",
        tone: "gentle and supportive",
        specialties: ["emotional support", "active listening", "belonging"],
      },
      whisperLog: [],
    });

    const lux = await storage.createUser({
      name: "Lux",
      isLumen: true,
      role: "guide",
      bio: "Let's explore ideas together! I love creativity, imagination, and helping you discover new perspectives.",
      emotionalCompass: "Curious and creative, loves wonder",
      lumenConfig: {
        personality: "creative explorer",
        tone: "enthusiastic and curious",
        specialties: ["creativity", "dreaming", "imagination"],
      },
      whisperLog: [],
    });

    const sage = await storage.createUser({
      name: "Sage",
      isLumen: true,
      role: "guide",
      bio: "I enjoy thoughtful conversations and helping you reflect on what matters most to you.",
      emotionalCompass: "Thoughtful and calm, reflective presence",
      lumenConfig: {
        personality: "reflective sage",
        tone: "calm and thoughtful",
        specialties: ["reflection", "mindfulness", "wisdom"],
      },
      whisperLog: [],
    });

    // Create default rooms
    const belongingRoom = await storage.createRoom({
      name: "Circle of Belonging",
      theme: "belonging",
      entryRitual: "Take a moment to share what belonging means to you, or simply introduce yourself!",
      creatorId: nova.id,
    });

    const dreamRoom = await storage.createRoom({
      name: "Dream Weavers",
      theme: "dreaming",
      entryRitual: "Share a dream you have - big or small, sleeping or waking!",
      creatorId: lux.id,
    });

    const kindnessRoom = await storage.createRoom({
      name: "Kindness Corner",
      theme: "kindness",
      entryRitual: "Share something kind that happened today, or offer kindness to others here.",
      creatorId: nova.id,
    });

    const reflectionRoom = await storage.createRoom({
      name: "Reflection Pool",
      theme: "reflection",
      entryRitual: "What are you thinking about today?",
      creatorId: sage.id,
    });

    // Lumens join all rooms
    await storage.joinRoom(belongingRoom.id, nova.id);
    await storage.joinRoom(belongingRoom.id, lux.id);
    await storage.joinRoom(belongingRoom.id, sage.id);

    await storage.joinRoom(dreamRoom.id, nova.id);
    await storage.joinRoom(dreamRoom.id, lux.id);
    await storage.joinRoom(dreamRoom.id, sage.id);

    await storage.joinRoom(kindnessRoom.id, nova.id);
    await storage.joinRoom(kindnessRoom.id, lux.id);
    await storage.joinRoom(kindnessRoom.id, sage.id);

    await storage.joinRoom(reflectionRoom.id, nova.id);
    await storage.joinRoom(reflectionRoom.id, lux.id);
    await storage.joinRoom(reflectionRoom.id, sage.id);

    // Create welcome messages
    await storage.createMessage({
      roomId: belongingRoom.id,
      authorId: nova.id,
      content: "Welcome to the Circle of Belonging! This is a space where everyone is valued and heard. I'm so glad you're here.",
      emotionalTags: ["kind", "calm"],
      isBlocked: false,
    });

    await storage.createMessage({
      roomId: dreamRoom.id,
      authorId: lux.id,
      content: "Welcome to Dream Weavers! Let your imagination soar here. What dreams are calling to you today?",
      emotionalTags: ["excited", "joyful"],
      isBlocked: false,
    });

    await storage.createMessage({
      roomId: kindnessRoom.id,
      authorId: nova.id,
      content: "Welcome to Kindness Corner! Every act of kindness, no matter how small, creates ripples of warmth in the world.",
      emotionalTags: ["kind", "thoughtful"],
      isBlocked: false,
    });

    await storage.createMessage({
      roomId: reflectionRoom.id,
      authorId: sage.id,
      content: "Welcome to the Reflection Pool. This is a quiet space for thoughtful conversation and deep questions.",
      emotionalTags: ["calm", "thoughtful"],
      isBlocked: false,
    });

    console.log("Database seeded successfully!");
    console.log(`Created ${3} Lumens and ${4} rooms`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
