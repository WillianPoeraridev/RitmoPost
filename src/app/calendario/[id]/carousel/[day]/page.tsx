import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { CalendarDay } from "@/lib/schema";
import { buildCarousel } from "@/lib/carousel";
import { PILLAR_LABELS } from "@/lib/schema";
import { CarouselStudio } from "@/components/carousel-studio";

function slugify(s: string): string {
  return s.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export default async function CarouselPage({
  params,
}: {
  params: Promise<{ id: string; day: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const { id, day: dayParam } = await params;
  const dayNum = Number(dayParam);

  const [cal] = await db
    .select()
    .from(calendar)
    .where(and(eq(calendar.id, id), eq(calendar.userId, session.user.id)))
    .limit(1);
  if (!cal) notFound();

  const dayData = (cal.content as CalendarDay[]).find((d) => d.day === dayNum);
  if (!dayData) notFound();

  // Conta os slides server-side; cor/tema/grid/download são interativos no cliente.
  const slideCount = buildCarousel(dayData, { businessName: cal.businessName }).length;
  const slug = slugify(cal.businessName);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-rose-400">
          RitmoPost
        </Link>
        <Link
          href={`/calendario/${id}`}
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          ← Voltar ao calendário
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-2">
          <p className="text-xs text-neutral-500 uppercase tracking-wide">
            Dia {dayNum} · {dayData.type}
            {dayData.pillar ? ` · ${PILLAR_LABELS[dayData.pillar]}` : ""}
          </p>
          <h1 className="text-2xl font-bold mt-1">{dayData.theme}</h1>
        </div>
        <p className="text-sm text-neutral-400 mb-8">
          {slideCount} slides prontos pra postar — escolha a cor da marca e baixe na ordem.
        </p>

        <CarouselStudio calendarId={id} day={dayNum} slideCount={slideCount} slug={slug} />
      </div>
    </div>
  );
}
