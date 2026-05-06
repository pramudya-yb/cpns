import { eq, or, isNull, SQL } from "drizzle-orm";

interface VisibilityTable {
  isPublic: any;
  creatorUserId: any;
}

export function buildVisibilityCondition<T extends VisibilityTable>(
  table: T,
  userId?: string,
): SQL | undefined {
  if (!userId) {
    return eq(table.isPublic, true);
  }
  return or(eq(table.isPublic, true), eq(table.creatorUserId, userId));
}
