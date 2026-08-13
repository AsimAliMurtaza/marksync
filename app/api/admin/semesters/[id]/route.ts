import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const semester = await prisma.semester.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            instructor: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!semester) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(semester);
  } catch (err) {
    console.error("Error fetching semester detail:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { name, start_date, startDate, end_date, endDate } = body;

    const sDate = startDate || start_date;
    const eDate = endDate || end_date;

    const updated = await prisma.semester.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(sDate && { startDate: new Date(sDate) }),
        ...(eDate && { endDate: new Date(eDate) }),
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating semester:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    await prisma.semester.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting semester:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
