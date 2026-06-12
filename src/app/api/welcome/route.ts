import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";

const bodySchema = z.object({ name: z.string().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { name } = parsed.data;

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "PostaJá <onboarding@resend.dev>",
    to: session.user.email,
    subject: "Seu acesso está ativo ✨",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1a1a2e">
        <h2 style="color:#7c3aed">Bem-vindo ao PostaJá, ${name}! 🎉</h2>
        <p>Seu acesso está ativo. Você tem <strong>1 calendário grátis</strong> pra usar agora.</p>
        <p style="margin:24px 0">
          <a href="${process.env.NEXT_PUBLIC_URL}/gerar"
             style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Gerar meu calendário →
          </a>
        </p>
        <p style="color:#6b7280;font-size:14px">
          Se tiver qualquer dúvida, é só responder esse email.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px">PostaJá · postaja.com.br</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
