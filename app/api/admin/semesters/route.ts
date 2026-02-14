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
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, start_date, end_date, created_by } = body;

    if (!name || !start_date || !end_date || !created_by) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const semester = await prisma.semesters.create({
      data: {
        name,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        created_by: BigInt(created_by),
      },
    });

    return NextResponse.json({
      ...semester,
      id: semester.id.toString(),
      created_by: semester.created_by.toString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
