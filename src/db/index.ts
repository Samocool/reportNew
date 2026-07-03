import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDb?: ReturnType<typeof drizzle>;
};

class LazyDb {
  private static instance: ReturnType<typeof drizzle> | null = null;
  private static pool: Pool | null = null;

  static getInstance() {
    if (!this.instance) {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("DATABASE_URL is required");
      }

      this.pool =
        globalForDb.__arenaNextJsPostgresqlPool ??
        new Pool({
          connectionString: databaseUrl,
        });

      if (process.env.NODE_ENV !== "production") {
        globalForDb.__arenaNextJsPostgresqlPool = this.pool;
      }

      this.instance = drizzle(this.pool);
      globalForDb.__arenaNextJsDb = this.instance;
    }
    return this.instance;
  }

  static getPool() {
    this.getInstance(); // Ensure db is initialized
    return this.pool!;
  }
}

// These are proxies that lazily initialize on first use
export const db = new Proxy({}, {
  get: (target, prop) => {
    return Reflect.get(LazyDb.getInstance(), prop);
  },
}) as unknown as ReturnType<typeof drizzle>;

export const pool = new Proxy({}, {
  get: (target, prop) => {
    return Reflect.get(LazyDb.getPool(), prop);
  },
}) as unknown as Pool;
