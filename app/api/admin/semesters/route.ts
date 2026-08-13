import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    return NextResponse.json(semesters);
  } catch (err) {
    console.error("Error fetching admin semesters:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, start_date, startDate, end_date, endDate, created_by } = body;

    const sDate = startDate || start_date;
    const eDate = endDate || end_date;

    if (!name || !sDate || !eDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const creatorId = Number(created_by || session.user.id);

    const semester = await prisma.semester.create({
      data: {
        name: name.trim(),
        startDate: new Date(sDate),
        endDate: new Date(eDate),
        createdBy: creatorId,
      },
    });

    return NextResponse.json(semester, { status: 201 });
  } catch (err) {
    console.error("Error creating semester:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
