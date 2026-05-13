import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updatePageContent } from "@/lib/actions/pages-content";
import type { Json } from "@/lib/database.types";

const bodySchema = z.object({
  content: z.union([z.array(z.unknown()), z.null()]),
});

/**
 * beforeunload / sendBeacon 용 자동저장 endpoint.
 * 평시에는 Server Action(updatePageContent)을 직접 호출하고,
 * 페이지 이탈 시점에서만 이 endpoint를 fallback으로 사용.
 *
 * sendBeacon은 Content-Type을 임의로 설정할 수 없으므로 body는 raw JSON 문자열.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const res = await updatePageContent({
    pageId: id,
    content: parsed.data.content as unknown as Json,
  });

  if (!res.ok) {
    const status = res.error === "unauthorized" ? 401 : 400;
    return NextResponse.json({ error: res.error }, { status });
  }
  return NextResponse.json({ ok: true, ...res.data });
}
