import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calendar } from "@/lib/schema";
import { CalendarPdf } from "@/lib/pdf";
import { renderToBuffer } from "@react-pdf/renderer";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import React from "react";
import type { DocumentProps } from "@react-pdf/renderer";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  const [cal] = await db
    .select()
    .from(calendar)
    .where(and(eq(calendar.id, id), eq(calendar.userId, session.user.id)))
    .limit(1);

  if (!cal) {
    return new NextResponse("Not found", { status: 404 });
  }

  const element = React.createElement(CalendarPdf, {
    businessName: cal.businessName,
    niche: cal.niche,
    month: cal.month,
    year: cal.year,
    days: cal.content,
  }) as React.ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(element);

  const filename = `postaja-${cal.businessName.replace(/\s+/g, "-").toLowerCase()}-${cal.month}-${cal.year}.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
