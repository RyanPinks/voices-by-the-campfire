import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebSocket } from "./websocket";
import { seedDatabase } from "./seed";
import { setupSimpleAuth, ensureUser } from "./simpleAuth";
import { insertUserSchema, insertRoomSchema, insertFriendshipSchema, insertModerationActionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup simple auth
  setupSimpleAuth(app);
  
  // Seed database on startup
  await seedDatabase();

  // Current user endpoint
  app.get("/api/user", ensureUser, async (req: any, res) => {
    res.json(req.user);
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  // Rooms
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getAllRooms();
      
      // Get member counts for each room
      const roomsWithCounts = await Promise.all(
        rooms.map(async (room) => {
          const members = await storage.getRoomMembers(room.id);
          return { ...room, memberCount: members.length };
        })
      );
      
      res.json(roomsWithCounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const room = await storage.getRoom(req.params.id);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(roomData);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ error: "Invalid room data" });
    }
  });

  app.get("/api/rooms/:id/members", async (req, res) => {
    try {
      const members = await storage.getRoomMembers(req.params.id);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch room members" });
    }
  });

  app.post("/api/rooms/:id/join", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      await storage.joinRoom(req.params.id, userId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to join room" });
    }
  });

  app.post("/api/rooms/:id/leave", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      await storage.leaveRoom(req.params.id, userId);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to leave room" });
    }
  });

  // Messages
  app.get("/api/rooms/:id/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getRoomMessages(req.params.id, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Friendships
  app.get("/api/users/:id/friendships", async (req, res) => {
    try {
      const friendships = await storage.getFriendships(req.params.id);
      res.json(friendships);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch friendships" });
    }
  });

  app.get("/api/friendships", async (req, res) => {
    try {
      const friendships = await storage.getAllFriendships();
      res.json(friendships);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch friendships" });
    }
  });

  app.post("/api/friendships", async (req, res) => {
    try {
      const friendshipData = insertFriendshipSchema.parse(req.body);
      const friendship = await storage.createFriendship(friendshipData);
      res.status(201).json(friendship);
    } catch (error) {
      res.status(400).json({ error: "Invalid friendship data" });
    }
  });

  app.patch("/api/friendships/:id/strength", async (req, res) => {
    try {
      const { strength } = req.body;
      if (typeof strength !== "number") {
        return res.status(400).json({ error: "strength must be a number" });
      }
      await storage.updateConnectionStrength(req.params.id, strength);
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update connection strength" });
    }
  });

  // Moderation
  app.get("/api/moderation/flagged", async (req, res) => {
    try {
      const flaggedMessages = await storage.getFlaggedMessages();
      res.json(flaggedMessages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch flagged messages" });
    }
  });

  app.post("/api/moderation/actions", async (req, res) => {
    try {
      const actionData = insertModerationActionSchema.parse(req.body);
      const action = await storage.createModerationAction(actionData);
      
      // If action is mute, also add to muted users
      if (actionData.actionType === "mute") {
        const mutedUntil = new Date();
        mutedUntil.setHours(mutedUntil.getHours() + 24); // 24 hour mute
        await storage.muteUser(actionData.targetUserId, actionData.reason, mutedUntil);
      }
      
      res.status(201).json(action);
    } catch (error) {
      res.status(400).json({ error: "Invalid moderation action data" });
    }
  });

  app.get("/api/moderation/muted", async (req, res) => {
    try {
      const mutedUsers = await storage.getMutedUsers();
      res.json(mutedUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch muted users" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket
  setupWebSocket(httpServer);

  return httpServer;
}
