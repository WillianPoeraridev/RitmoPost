import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendEmail, emailButton } from "@/lib/email";
import { z } from "zod";

const bodySchema = z.object({ name: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name } = parsed.data;

  await sendEmail(
    session.user.email,
    "Seu acesso está ativo ✨",
    `
      <h2 style="color:#7c3aed">Bem-vindo ao RitmoPost, ${name}! 🎉</h2>
      <p>Seu acesso está ativo. Você tem <strong>1 calendário grátis</strong> pra usar agora.</p>
      ${emailButton(`${process.env.NEXT_PUBLIC_URL}/gerar`, "Gerar meu calendário →")}
      <p style="color:#6b7280;font-size:14px">
        Se tiver qualquer dúvida, é só responder esse email.
      </p>
    `
  );

  return NextResponse.json({ ok: true });
}
