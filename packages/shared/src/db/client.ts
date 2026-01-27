import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// D1 database instance type
export type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
  batch: <T = unknown>(statements: D1PreparedStatement[]) => Promise<D1Result<T>[]>;
  exec: (query: string) => Promise<D1ExecResult>;
};

type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>(colName?: string) => Promise<T | null>;
  run: () => Promise<D1Result>;
  all: <T = unknown>() => Promise<D1Result<T>>;
  raw: <T = unknown>() => Promise<T[]>;
};

type D1Result<T = unknown> = {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: {
    duration: number;
    changes: number;
    last_row_id: number;
    served_by: string;
  };
};

type D1ExecResult = {
  count: number;
  duration: number;
};

// Create Drizzle database instance from D1
export function createDb(d1: D1Database) {
  return drizzle(d1 as any, { schema });
}

// Type for the database instance
export type DbInstance = ReturnType<typeof createDb>;

// Export schema
export { schema };

// Helper to get database from Cloudflare env
export function getDb(env: { DB: D1Database }): DbInstance {
  return createDb(env.DB);
}
