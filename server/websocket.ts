import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import { storage } from "./storage";
import { moderateWithAI } from "./moderation";
import { generateLumenResponse, analyzeEmotionalTone } from "./ai";
import type { User } from "@shared/schema";

interface WebSocketClient extends WebSocket {
  userId?: string;
  roomId?: string;
}

interface ClientMessage {
  type: "join" | "message" | "leave" | "typing";
  roomId?: string;
  userId?: string;
  content?: string;
  emotionalTags?: string[];
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });
  
  console.log("WebSocket server initialized at /ws");

  wss.on("connection", (ws: WebSocketClient) => {
    console.log("New WebSocket connection");

    ws.on("message", async (data: Buffer) => {
      try {
        const message: ClientMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case "join":
            if (message.roomId && message.userId) {
              ws.roomId = message.roomId;
              ws.userId = message.userId;
              
              // Join room in database
              await storage.joinRoom(message.roomId, message.userId);
              
              // Notify room
              broadcast(wss, message.roomId, {
                type: "user_joined",
                userId: message.userId,
                roomId: message.roomId,
              });
            }
            break;

          case "message":
            if (message.roomId && message.userId && message.content) {
              await handleMessage(wss, message);
            }
            break;

          case "leave":
            if (ws.roomId && ws.userId) {
              await storage.leaveRoom(ws.roomId, ws.userId);
              broadcast(wss, ws.roomId, {
                type: "user_left",
                userId: ws.userId,
                roomId: ws.roomId,
              });
            }
            break;

          case "typing":
            if (ws.roomId && ws.userId) {
              broadcast(wss, ws.roomId, {
                type: "user_typing",
                userId: ws.userId,
                roomId: ws.roomId,
              }, ws);
            }
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
      }
    });

    ws.on("close", async () => {
      console.log("WebSocket connection closed");
      if (ws.roomId && ws.userId) {
        await storage.leaveRoom(ws.roomId, ws.userId);
        broadcast(wss, ws.roomId, {
          type: "user_left",
          userId: ws.userId,
          roomId: ws.roomId,
        });
      }
    });
  });

  return wss;
}

async function handleMessage(wss: WebSocketServer, message: ClientMessage) {
  if (!message.roomId || !message.userId || !message.content) return;

  // Check if user is muted
  const mutedUsers = await storage.getMutedUsers();
  if (mutedUsers.includes(message.userId)) {
    // Send error to this user only
    const userWs = findUserSocket(wss, message.userId);
    if (userWs) {
      userWs.send(JSON.stringify({
        type: "error",
        message: "You are currently muted and cannot send messages.",
      }));
    }
    return;
  }

  // Moderate content
  const moderation = await moderateWithAI(message.content, process.env.OPENAI_API_KEY);
  
  if (!moderation.isClean) {
    // Block message and notify user
    const userWs = findUserSocket(wss, message.userId);
    if (userWs) {
      userWs.send(JSON.stringify({
        type: "message_blocked",
        reason: moderation.reason,
        flaggedTerms: moderation.flaggedTerms,
      }));
    }
    
    // Log blocked message
    const blockedMsg = await storage.createMessage({
      roomId: message.roomId,
      authorId: message.userId,
      content: message.content,
      emotionalTags: message.emotionalTags || [],
      isBlocked: true,
      blockReason: moderation.reason,
    });
    
    return;
  }

  // Create message in database
  const newMessage = await storage.createMessage({
    roomId: message.roomId,
    authorId: message.userId,
    content: message.content,
    emotionalTags: message.emotionalTags || [],
    isBlocked: false,
  });

  // Get author info
  const author = await storage.getUser(message.userId);
  if (!author) return;

  // Broadcast message to room
  broadcast(wss, message.roomId, {
    type: "new_message",
    message: {
      ...newMessage,
      author,
    },
  });

  // Check if we should trigger AI Lumen responses
  const roomMembers = await storage.getRoomMembers(message.roomId);
  const lumens = roomMembers.filter(m => m.isLumen);
  
  // Randomly respond with one Lumen (30% chance per Lumen)
  for (const lumen of lumens) {
    if (Math.random() < 0.3) {
      setTimeout(async () => {
        await generateAndSendLumenResponse(wss, message.roomId!, lumen, message.content!);
      }, 1000 + Math.random() * 2000); // Random delay 1-3 seconds
      break; // Only one Lumen responds
    }
  }
}

async function generateAndSendLumenResponse(
  wss: WebSocketServer,
  roomId: string,
  lumen: User,
  userMessage: string
) {
  try {
    // Get recent conversation history
    const recentMessages = await storage.getRoomMessages(roomId, 10);
    const conversationHistory = recentMessages.map(msg => ({
      role: (msg.author.isLumen ? "assistant" : "user") as "user" | "assistant",
      content: msg.content,
    }));

    // Generate response
    const responseContent = await generateLumenResponse(lumen, userMessage, conversationHistory);
    const emotionalTags = analyzeEmotionalTone(responseContent);

    // Save to database
    const lumenMessage = await storage.createMessage({
      roomId,
      authorId: lumen.id,
      content: responseContent,
      emotionalTags,
      isBlocked: false,
    });

    // Broadcast to room
    broadcast(wss, roomId, {
      type: "new_message",
      message: {
        ...lumenMessage,
        author: lumen,
      },
    });
  } catch (error) {
    console.error("Error generating Lumen response:", error);
  }
}

function broadcast(wss: WebSocketServer, roomId: string, data: any, exclude?: WebSocket) {
  const message = JSON.stringify(data);
  Array.from(wss.clients).forEach((client: WebSocket) => {
    const wsClient = client as WebSocketClient;
    if (wsClient.roomId === roomId && client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function findUserSocket(wss: WebSocketServer, userId: string): WebSocketClient | undefined {
  for (const client of Array.from(wss.clients)) {
    const wsClient = client as WebSocketClient;
    if (wsClient.userId === userId && client.readyState === WebSocket.OPEN) {
      return wsClient;
    }
  }
  return undefined;
}
