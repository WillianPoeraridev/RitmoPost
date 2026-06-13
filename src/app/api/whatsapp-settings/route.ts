import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/lib/schema";
import { isValidWhatsAppNumber } from "@/lib/evolution";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";

const bodySchema = z.object({
  // Aceita formatos comuns ((51) 99999-8888 etc.) — normalizamos pra dígitos.
  whatsappNumber: z.string().max(25),
  whatsappOptIn: z.boolean(),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  let digits = parsed.data.whatsappNumber.replace(/\D/g, "");
  // DDD + número sem o código do país → assume Brasil.
  if (digits && !digits.startsWith("55") && (digits.length === 10 || digits.length === 11)) {
    digits = `55${digits}`;
  }

  if (parsed.data.whatsappOptIn && !isValidWhatsAppNumber(digits)) {
    return NextResponse.json({ error: "invalid_number" }, { status: 400 });
  }

  await db
    .update(user)
    .set({
      whatsappNumber: digits || null,
      whatsappOptIn: parsed.data.whatsappOptIn,
    })
    .where(eq(user.id, session.user.id));

  return NextResponse.json({ ok: true });
}
