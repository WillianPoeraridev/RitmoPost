import { NextRequest, NextResponse } from "next/server";
import { generateCalendar } from "@/lib/claude";
import { z } from "zod";

// Generation can take ~30s; raise above the default function timeout.
export const maxDuration = 60;

const bodySchema = z.object({
  niche: z.string().min(1).max(100),
  businessName: z.string().min(1).max(100),
  secret: z.string(),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { niche, businessName, secret } = parsed.data;

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  try {
    const days = await generateCalendar(niche, businessName, month, year);
    return NextResponse.json({ days, month, year });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[admin/generate] failed:", detail);
    return NextResponse.json({ error: "generation_failed", detail }, { status: 500 });
  }
}
