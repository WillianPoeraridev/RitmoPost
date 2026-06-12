import type { InferSelectModel } from "drizzle-orm";
import type { user } from "./schema";

type UserRow = InferSelectModel<typeof user>;

/** How many days a free user can see in a generated calendar. */
export const FREE_VISIBLE_DAYS = 7;

/**
 * A user is Pro only with an active (non-expired) pro plan.
 * Centralizes the check so the calendar view, PDF export and dashboard agree.
 */
export function isProUser(
  u: Pick<UserRow, "plan" | "planExpiresAt"> | null | undefined
): boolean {
  if (!u || u.plan !== "pro") return false;
  if (u.planExpiresAt && u.planExpiresAt.getTime() < Date.now()) return false;
  return true;
}
