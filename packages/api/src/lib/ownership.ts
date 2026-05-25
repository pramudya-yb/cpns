import { eq } from "drizzle-orm";
import { throwForbidden, throwNotFound } from "./errors";

interface OwnedRow {
  creatorUserId: string | null;
}

export function assertOwnership(row: OwnedRow | null | undefined, userId: string, resource = "Resource"): void {
  if (!row) throwNotFound(resource);
  if (row.creatorUserId !== userId) throwForbidden();
}

export function ownershipFilter<TTable extends Record<string, any>>(
  table: TTable,
  userId: string,
  creatorColumn: keyof TTable,
) {
  return eq(table[creatorColumn as string], userId);
}
