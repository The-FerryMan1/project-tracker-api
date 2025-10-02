import {
  pgTable,
  timestamp,
  varchar,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const projectStatus = pgEnum("project_status", [
  "to-do",
  "in-progress",
  "completed",
]);
export const userTable = pgTable("user", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("name", { length: 255 }).notNull(),
  createAt: timestamp("createdAt").defaultNow(),
});

export const projectTable = pgTable("project", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  user_id: integer("user_id").references(() => userTable.id),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  status: projectStatus("status").notNull().default("to-do").default("to-do"),
  createAt: timestamp("createdAt").defaultNow(),
});
