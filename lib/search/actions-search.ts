"use server";

import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { searchPages } from "./search-pages";
import type { SearchHit } from "./types";

const inputSchema = z.object({
  q: z.string().max(200),
  limit: z.number().int().min(1).max(50).optional(),
  sort: z.enum(["relevance", "recent"]).optional(),
});

export type SearchActionResult =
  | { ok: true; data: { hits: SearchHit[] } }
  | { ok: false; error: "unauthorized" | "invalid_input" | "search_failed" };

export async function searchPagesAction(
  input: z.input<typeof inputSchema>,
): Promise<SearchActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid_input" };

  try {
    const hits = await searchPages(parsed.data.q, {
      limit: parsed.data.limit,
      sort: parsed.data.sort ?? "relevance",
    });
    return { ok: true, data: { hits } };
  } catch {
    return { ok: false, error: "search_failed" };
  }
}
