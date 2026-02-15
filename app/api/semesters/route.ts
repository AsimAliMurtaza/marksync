import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/libs/prisma";

export async function GET() {
  try {
    const semesters = await prisma.semesters.findMany({
      orderBy: { created_at: "desc" },
    });

    const serializedSemesters = semesters.map((semester) => ({
      ...semester,
      id: semester.id.toString(),
      created_by: semester.created_by.toString(),
    }));

    return NextResponse.json(serializedSemesters); // simple array
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
