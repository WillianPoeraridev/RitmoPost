import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar, businessProfile } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import type { CalendarDay } from "@/lib/schema";
import { buildCarousel, resolvePalette, isValidHex, SlideView, SLIDE_W, SLIDE_H } from "@/lib/carousel";
import type { Theme } from "@/lib/carousel";

// Renderiza UM slide do carrossel de UM dia em PNG. O preview consome esta rota
// uma vez por slide (?id&day&slide). Determinístico, on-brand, custo ~R$0.

type FontTriple = { name: string; data: ArrayBuffer; weight: 400 | 600 | 800; style: "normal" }[];
let fontsCache: FontTriple | null = null;

async function loadFonts(): Promise<FontTriple> {
  if (fontsCache) return fontsCache;
  const dir = join(process.cwd(), "assets", "fonts");
  const read = async (w: number) => {
    const buf = await readFile(join(dir, `inter-latin-${w}-normal.woff`));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  };
  fontsCache = [
    { name: "Inter", data: await read(400), weight: 400, style: "normal" },
    { name: "Inter", data: await read(600), weight: 600, style: "normal" },
    { name: "Inter", data: await read(800), weight: 800, style: "normal" },
  ];
  return fontsCache;
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const sp = req.nextUrl.searchParams;
  const id = sp.get("id");
  const day = Number(sp.get("day"));
  const slideIndex = Number(sp.get("slide"));
  if (!id || !Number.isInteger(day) || !Number.isInteger(slideIndex)) {
    return new Response("Bad request", { status: 400 });
  }

  const [cal] = await db
    .select()
    .from(calendar)
    .where(and(eq(calendar.id, id), eq(calendar.userId, session.user.id)))
    .limit(1);
  if (!cal) return new Response("Not found", { status: 404 });

  const dayData = (cal.content as CalendarDay[]).find((d) => d.day === day);
  if (!dayData) return new Response("Day not found", { status: 404 });

  // Handle do Instagram vem do perfil, quando o calendário foi gerado por um.
  let handle: string | undefined;
  if (cal.profileId) {
    const [profile] = await db
      .select({ handle: businessProfile.instagramHandle })
      .from(businessProfile)
      .where(eq(businessProfile.id, cal.profileId))
      .limit(1);
    handle = profile?.handle ?? undefined;
  }

  const brand = { businessName: cal.businessName, handle };
  const slides = buildCarousel(dayData, brand);
  if (slideIndex < 0 || slideIndex >= slides.length) {
    return new Response("Slide out of range", { status: 404 });
  }

  // Cor de marca e tema: hoje sem UI (defaults coral/dark). A rota já aceita os
  // valores via query pra o Passo 2 (perfil do cliente) plugar sem retrabalho.
  const colorParam = sp.get("color");
  const color = isValidHex(colorParam) ? colorParam : undefined;
  const theme: Theme = sp.get("theme") === "light" ? "light" : "dark";
  const palette = resolvePalette(color, theme);

  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <SlideView
        slide={slides[slideIndex]}
        brand={brand}
        p={palette}
        index={slideIndex}
        total={slides.length}
      />
    ),
    { width: SLIDE_W, height: SLIDE_H, fonts }
  );
}
