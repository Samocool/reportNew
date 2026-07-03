import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { reportEntries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await db
      .select()
      .from(reportEntries)
      .orderBy(desc(reportEntries.createdAt));
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = await db
      .insert(reportEntries)
      .values({
        id: body.id,
        entryType: body.entryType,
        date: body.date,
        minutes: body.minutes,
        contactName: body.contactName || "",
        contactAddress: body.contactAddress || "",
        contactPhone: body.contactPhone || "",
        nextVisitDate: body.nextVisitDate || "",
        nextVisitTime: body.nextVisitTime || "",
        pastInteractionData: body.pastInteractionData || "",
        territory: body.territory || "",
      })
      .returning();
    return NextResponse.json(entry[0], { status: 201 });
  } catch (error) {
    console.error("Failed to create entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const entry = await db
      .update(reportEntries)
      .set({
        entryType: body.entryType,
        date: body.date,
        minutes: body.minutes,
        contactName: body.contactName || "",
        contactAddress: body.contactAddress || "",
        contactPhone: body.contactPhone || "",
        nextVisitDate: body.nextVisitDate || "",
        nextVisitTime: body.nextVisitTime || "",
        pastInteractionData: body.pastInteractionData || "",
        territory: body.territory || "",
      })
      .where(eq(reportEntries.id, body.id))
      .returning();
    return NextResponse.json(entry[0]);
  } catch (error) {
    console.error("Failed to update entry:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await db.delete(reportEntries).where(eq(reportEntries.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
