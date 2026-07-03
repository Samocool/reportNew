import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reportEntries } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const entries = await db.select().from(reportEntries).orderBy(reportEntries.date);
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [entry] = await db.insert(reportEntries).values(body).returning();
  return NextResponse.json(entry, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...data } = body;
  const [entry] = await db
    .update(reportEntries)
    .set(data)
    .where(eq(reportEntries.id, id))
    .returning();
  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await db.delete(reportEntries).where(eq(reportEntries.id, id));
  return NextResponse.json({ success: true });
}
