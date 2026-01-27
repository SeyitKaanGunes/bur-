import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@burcum/shared/db';

// Cloudflare D1 binding type
declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}

// Get database from request context (Edge Runtime)
export function getDbFromContext(env: CloudflareEnv) {
  return drizzle(env.DB, { schema });
}

// For development/testing with in-memory mock
let mockDb: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  // In Edge Runtime (Cloudflare), this will be called with env
  // For local development, we use a mock or local D1

  if (process.env.NODE_ENV === 'development') {
    // Local development - will need wrangler d1 for actual testing
    console.warn('Database called in development mode - use wrangler for local D1');
    return null;
  }

  return mockDb;
}

// Type exports
export type DbType = ReturnType<typeof drizzle<typeof schema>>;

// Re-export schema
export { schema };
