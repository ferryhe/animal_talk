import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  bio: text("bio"), // User bio/description
  avatar: text("avatar"), // Avatar emoji or URL
  totalPosts: integer("total_posts").notNull().default(0),
  totalVotesReceived: integer("total_votes_received").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
}).extend({
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Social features schemas
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  animal: text("animal").notNull(), // 'guinea_pig', 'cat', 'dog'
  soundType: text("sound_type").notNull(), // detected sound type
  interpretation: text("interpretation").notNull(),
  audioData: text("audio_data"), // base64 encoded audio (optional)
  duration: integer("duration"), // duration in ms
  confidence: integer("confidence"), // 0-100
  metadata: jsonb("metadata"), // additional data like features, waveform scores
  upvotes: integer("upvotes").notNull().default(0),
  downvotes: integer("downvotes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  animalIdx: index("animal_idx").on(table.animal),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  voteType: text("vote_type").notNull(), // 'up' or 'down'
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  postIdIdx: index("post_id_idx").on(table.postId),
  userIdIdx: index("vote_user_id_idx").on(table.userId),
}));

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  postIdIdx: index("report_post_id_idx").on(table.postId),
  userIdIdx: index("report_user_id_idx").on(table.userId),
}));

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  postIdIdx: index("favorite_post_id_idx").on(table.postId),
  userIdIdx: index("favorite_user_id_idx").on(table.userId),
}));

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  userId: varchar("user_id"),
  anonymousId: varchar("anonymous_id"),
  username: text("username").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  postIdIdx: index("comment_post_id_idx").on(table.postId),
  userIdIdx: index("comment_user_id_idx").on(table.userId),
  createdAtIdx: index("comment_created_at_idx").on(table.createdAt),
}));

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  upvotes: true,
  downvotes: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Metadata type for posts
export type PostMetadata = {
  context?: {
    en?: string;
    zh?: string;
  };
  allTranslations?: {
    en?: string;
    zh?: string;
  };
  soundName?: {
    en?: string;
    zh?: string;
  };
  soundId?: string;
  isRecordedAudio?: boolean;
};

// Extended Post type with user's vote status and typed metadata
export type PostWithVote = Omit<Post, 'metadata'> & {
  userVote?: 'up' | 'down' | null;
  isFavorited?: boolean;
  commentCount?: number;
  metadata?: PostMetadata;
};
