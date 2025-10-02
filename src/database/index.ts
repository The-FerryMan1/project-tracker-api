import { drizzle } from "drizzle-orm/postgres-js";
import postgres = require("postgres");

async function main() {
  // Disable prefetch as it is not supported for "Transaction" pool mode
  const client = postgres(Bun.env.DATABASE_URL!, { prepare: false });
  const db = drizzle({ client });
}

main();
