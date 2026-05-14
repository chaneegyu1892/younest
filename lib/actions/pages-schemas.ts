import { z } from "zod";

/**
 * Page mutation Zod schemas shared between Server Actions and tests.
 *
 * "use server" files (lib/actions/pages.ts) can only export async functions,
 * so schemas live here and are imported into both the action and the test.
 */

export const moveSchema = z.object({
  id: z.string().uuid(),
  newParentId: z.string().uuid().nullable(),
  newPosition: z.number().finite().optional(),
});
