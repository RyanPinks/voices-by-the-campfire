import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for session management)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - both humans and AI Lumens
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  isLumen: boolean("is_lumen").notNull().default(false),
  role: varchar("role", { length: 50 }).notNull().default("member"), // admin, guide, friend, member
  avatar: text("avatar"),
  bio: text("bio"),
  emotionalCompass: text("emotional_compass"),
  // For Lumens only
  lumenConfig: jsonb("lumen_config"), // personality settings, response style, etc.
  whisperLog: jsonb("whisper_log").default(sql`'[]'::jsonb`), // internal thoughts for Lumens
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Rooms/chatrooms
export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  theme: varchar("theme", { length: 50 }).notNull(), // belonging, dreaming, kindness, etc.
  entryRitual: text("entry_ritual"),
  creatorId: varchar("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Messages in rooms
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  emotionalTags: jsonb("emotional_tags").default(sql`'[]'::jsonb`), // array of emotion strings
  isBlocked: boolean("is_blocked").notNull().default(false),
  blockReason: text("block_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Room membership
export const roomMembers = pgTable("room_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

// Friendships between users and Lumens
export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId1: varchar("user_id_1").notNull().references(() => users.id, { onDelete: "cascade" }),
  userId2: varchar("user_id_2").notNull().references(() => users.id, { onDelete: "cascade" }),
  connectionStrength: integer("connection_strength").notNull().default(1), // for constellation visualization
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Moderation actions
export const moderationActions = pgTable("moderation_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").references(() => messages.id, { onDelete: "set null" }),
  targetUserId: varchar("target_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moderatorId: varchar("moderator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  actionType: varchar("action_type", { length: 50 }).notNull(), // warn, mute, remove
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Muted users
export const mutedUsers = pgTable("muted_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mutedUntil: timestamp("muted_until"),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertRoomMemberSchema = createInsertSchema(roomMembers).omit({ id: true, joinedAt: true });
export const insertFriendshipSchema = createInsertSchema(friendships).omit({ id: true, createdAt: true });
export const insertModerationActionSchema = createInsertSchema(moderationActions).omit({ id: true, createdAt: true });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertRoomMember = z.infer<typeof insertRoomMemberSchema>;
export type RoomMember = typeof roomMembers.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertModerationAction = z.infer<typeof insertModerationActionSchema>;
export type ModerationAction = typeof moderationActions.$inferSelect;
