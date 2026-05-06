import { z } from "zod";
import { sql } from "drizzle-orm";

export const paginationSchema = z.object({
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export function paginateDefaults(input?: PaginationInput) {
  return {
    limit: input?.limit ?? 20,
    offset: input?.offset ?? 0,
  };
}

export function countSql(column: any) {
  return sql<number>`count(*)::int`;
}
