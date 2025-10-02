import { drizzle } from "drizzle-orm/postgres-js";

export const db = () => {
  const db = drizzle(Bun.env.DATABASE_URL!);
  return db;
};
