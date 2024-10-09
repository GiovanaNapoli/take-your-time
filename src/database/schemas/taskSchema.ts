import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const task = sqliteTable("task", {
  id: int("id").primaryKey(),
  title: text("name").notNull(),
  description: text("description").notNull(),
  isDone: int("isDone").notNull().default(0),
});
