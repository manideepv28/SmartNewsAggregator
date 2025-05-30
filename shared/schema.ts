import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  preferences: jsonb("preferences").$type<{
    categories: string[];
    keywords: string[];
  }>().default({ categories: [], keywords: [] }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  externalId: text("external_id").unique(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  urlToImage: text("url_to_image"),
  publishedAt: timestamp("published_at"),
  source: jsonb("source").$type<{ name: string; id?: string }>(),
  category: text("category"),
  aiScore: integer("ai_score").default(0), // 0-100 score
  aiSummary: text("ai_summary"),
});

export const userFavorites = pgTable("user_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  articleId: integer("article_id").references(() => articles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
});

export const insertFavoriteSchema = createInsertSchema(userFavorites).pick({
  userId: true,
  articleId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
