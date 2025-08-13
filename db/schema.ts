import { sql } from "drizzle-orm";
import { pgTable, serial, integer, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    username: text("username").primaryKey(),
    // twitter: text("twitter"),
    // linkedin: text("linkedin"),
    // clerk: text("clerk"),
    bio: text("bio")
});

// export type InsertUser = typeof usersTable.$inferInsert;
// export type SelectUser = typeof usersTable.$inferSelect;