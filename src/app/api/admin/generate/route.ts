import { NextRequest, NextResponse } from "next/server";
import { generateCalendar } from "@/lib/claude";
import { z } from "zod";

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

  const days = await generateCalendar(niche, businessName, month, year);
  return NextResponse.json({ days, month, year });
}
