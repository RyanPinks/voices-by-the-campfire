import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, or, desc, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  User, InsertUser,
  Room, InsertRoom,
  Message, InsertMessage,
  RoomMember, InsertRoomMember,
  Friendship, InsertFriendship,
  ModerationAction, InsertModerationAction,
} from "@shared/schema";

const dbClient = neon(process.env.DATABASE_URL!);
export const db = drizzle(dbClient, { schema });

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByName(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Rooms
  getRoom(id: string): Promise<Room | undefined>;
  getAllRooms(): Promise<Room[]>;
  createRoom(room: InsertRoom): Promise<Room>;
  getRoomMembers(roomId: string): Promise<User[]>;
  joinRoom(roomId: string, userId: string): Promise<void>;
  leaveRoom(roomId: string, userId: string): Promise<void>;
  
  // Messages
  getMessage(id: string): Promise<Message | undefined>;
  getRoomMessages(roomId: string, limit?: number): Promise<(Message & { author: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  blockMessage(id: string, reason: string): Promise<void>;
  
  // Friendships
  getFriendships(userId: string): Promise<(Friendship & { friend: User })[]>;
  createFriendship(friendship: InsertFriendship): Promise<Friendship>;
  getAllFriendships(): Promise<(Friendship & { user1: User; user2: User })[]>;
  updateConnectionStrength(friendshipId: string, strength: number): Promise<void>;
  
  // Moderation
  getFlaggedMessages(): Promise<(Message & { author: User })[]>;
  createModerationAction(action: InsertModerationAction): Promise<ModerationAction>;
  getMutedUsers(): Promise<string[]>;
  muteUser(userId: string, reason: string, mutedUntil?: Date): Promise<void>;
}

export class DbStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByName(name: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.name, name)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const result = await db.update(schema.users).set(updates).where(eq(schema.users.id, id)).returning();
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(schema.users);
  }

  // Rooms
  async getRoom(id: string): Promise<Room | undefined> {
    const result = await db.select().from(schema.rooms).where(eq(schema.rooms.id, id)).limit(1);
    return result[0];
  }

  async getAllRooms(): Promise<Room[]> {
    return await db.select().from(schema.rooms);
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const result = await db.insert(schema.rooms).values(room).returning();
    const newRoom = result[0];
    // Auto-join creator
    await this.joinRoom(newRoom.id, room.creatorId);
    return newRoom;
  }

  async getRoomMembers(roomId: string): Promise<User[]> {
    const result = await db
      .select({ user: schema.users })
      .from(schema.roomMembers)
      .innerJoin(schema.users, eq(schema.roomMembers.userId, schema.users.id))
      .where(eq(schema.roomMembers.roomId, roomId));
    return result.map(r => r.user);
  }

  async joinRoom(roomId: string, userId: string): Promise<void> {
    await db.insert(schema.roomMembers).values({ roomId, userId }).onConflictDoNothing();
  }

  async leaveRoom(roomId: string, userId: string): Promise<void> {
    await db.delete(schema.roomMembers).where(
      and(
        eq(schema.roomMembers.roomId, roomId),
        eq(schema.roomMembers.userId, userId)
      )
    );
  }

  // Messages
  async getMessage(id: string): Promise<Message | undefined> {
    const result = await db.select().from(schema.messages).where(eq(schema.messages.id, id)).limit(1);
    return result[0];
  }

  async getRoomMessages(roomId: string, limit: number = 50): Promise<(Message & { author: User })[]> {
    const result = await db
      .select({
        message: schema.messages,
        author: schema.users,
      })
      .from(schema.messages)
      .innerJoin(schema.users, eq(schema.messages.authorId, schema.users.id))
      .where(and(
        eq(schema.messages.roomId, roomId),
        eq(schema.messages.isBlocked, false)
      ))
      .orderBy(desc(schema.messages.createdAt))
      .limit(limit);
    
    return result.map(r => ({ ...r.message, author: r.author })).reverse();
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(schema.messages).values(message).returning();
    return result[0];
  }

  async blockMessage(id: string, reason: string): Promise<void> {
    await db.update(schema.messages).set({ isBlocked: true, blockReason: reason }).where(eq(schema.messages.id, id));
  }

  // Friendships
  async getFriendships(userId: string): Promise<(Friendship & { friend: User })[]> {
    const result = await db
      .select({
        friendship: schema.friendships,
        friend: schema.users,
      })
      .from(schema.friendships)
      .innerJoin(
        schema.users,
        or(
          and(eq(schema.friendships.userId1, userId), eq(schema.users.id, schema.friendships.userId2)),
          and(eq(schema.friendships.userId2, userId), eq(schema.users.id, schema.friendships.userId1))
        )!
      )
      .where(
        or(
          eq(schema.friendships.userId1, userId),
          eq(schema.friendships.userId2, userId)
        )
      );
    
    return result.map(r => ({ ...r.friendship, friend: r.friend }));
  }

  async createFriendship(friendship: InsertFriendship): Promise<Friendship> {
    const result = await db.insert(schema.friendships).values(friendship).returning();
    return result[0];
  }

  async getAllFriendships(): Promise<(Friendship & { user1: User; user2: User })[]> {
    const result = await db
      .select({
        friendship: schema.friendships,
        user1: schema.users,
      })
      .from(schema.friendships)
      .innerJoin(schema.users, eq(schema.friendships.userId1, schema.users.id));

    const withUser2 = await Promise.all(
      result.map(async (r) => {
        const user2Result = await db.select().from(schema.users).where(eq(schema.users.id, r.friendship.userId2)).limit(1);
        return { ...r.friendship, user1: r.user1, user2: user2Result[0] };
      })
    );

    return withUser2;
  }

  async updateConnectionStrength(friendshipId: string, strength: number): Promise<void> {
    await db.update(schema.friendships).set({ connectionStrength: strength }).where(eq(schema.friendships.id, friendshipId));
  }

  // Moderation
  async getFlaggedMessages(): Promise<(Message & { author: User })[]> {
    const result = await db
      .select({
        message: schema.messages,
        author: schema.users,
      })
      .from(schema.messages)
      .innerJoin(schema.users, eq(schema.messages.authorId, schema.users.id))
      .where(eq(schema.messages.isBlocked, true))
      .orderBy(desc(schema.messages.createdAt))
      .limit(50);
    
    return result.map(r => ({ ...r.message, author: r.author }));
  }

  async createModerationAction(action: InsertModerationAction): Promise<ModerationAction> {
    const result = await db.insert(schema.moderationActions).values(action).returning();
    return result[0];
  }

  async getMutedUsers(): Promise<string[]> {
    const result = await db
      .select({ userId: schema.mutedUsers.userId })
      .from(schema.mutedUsers)
      .where(
        or(
          sql`${schema.mutedUsers.mutedUntil} IS NULL`,
          sql`${schema.mutedUsers.mutedUntil} > NOW()`
        )!
      );
    return result.map(r => r.userId);
  }

  async muteUser(userId: string, reason: string, mutedUntil?: Date): Promise<void> {
    await db.insert(schema.mutedUsers).values({ userId, reason, mutedUntil });
  }
}

export const storage = new DbStorage();
