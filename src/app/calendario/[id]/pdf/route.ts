import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar, user } from "@/lib/schema";
import { CalendarPdf } from "@/lib/pdf";
import { isProUser, FREE_VISIBLE_DAYS } from "@/lib/plan";
import { renderToBuffer } from "@react-pdf/renderer";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import React from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { CalendarDay } from "@/lib/schema";

const VALID_COLORS = /^#[0-9a-fA-F]{6}$/;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const color = req.nextUrl.searchParams.get("color") ?? "#7c3aed";
  const primaryColor = VALID_COLORS.test(color) ? color : "#7c3aed";

  const [cal] = await db
    .select()
    .from(calendar)
    .where(and(eq(calendar.id, id), eq(calendar.userId, session.user.id)))
    .limit(1);

  if (!cal) {
    return new NextResponse("Not found", { status: 404 });
  }

  const [dbUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, session.user.id))
    .limit(1);

  const isPro = isProUser(dbUser);
  const allDays = cal.content as CalendarDay[];
  // Free users get a watermarked preview limited to the first days; Pro gets the full clean PDF.
  const days = isPro ? allDays : allDays.slice(0, FREE_VISIBLE_DAYS);

  const element = React.createElement(CalendarPdf, {
    businessName: cal.businessName,
    niche: cal.niche,
    month: cal.month,
    year: cal.year,
    days,
    primaryColor,
    watermark: !isPro,
    totalDays: allDays.length,
  }) as React.ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(element);

  const filename = `ritmopost-${cal.businessName.replace(/\s+/g, "-").toLowerCase()}-${cal.month}-${cal.year}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
