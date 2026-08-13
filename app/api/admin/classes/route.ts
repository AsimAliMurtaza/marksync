import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const semesterId = searchParams.get("semester_id") || searchParams.get("semesterId");

    const courses = await prisma.course.findMany({
      where: semesterId ? { semesterId: Number(semesterId) } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        semester: { select: { id: true, name: true } },
        instructor: { select: { id: true, name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    });

    return NextResponse.json({ success: true, data: courses });
  } catch (error) {
    console.error("Error fetching admin classes:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching classes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      code,
      room,
      day_of_week,
      dayOfWeek,
      start_time,
      startTime,
      end_time,
      endTime,
      latitude,
      longitude,
      allowed_radius,
      allowedRadius,
      semester_id,
      semesterId,
      instructor_id,
      instructorId,
    } = body;

    const targetSemesterId = Number(semesterId || semester_id);
    if (!title || !code || !targetSemesterId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, code, semesterId)" },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        code: code.trim().toUpperCase(),
        room: room || "TBA",
        dayOfWeek: dayOfWeek || day_of_week || "Monday",
        startTime: startTime || start_time || "09:00",
        endTime: endTime || end_time || "10:30",
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        allowedRadius: allowedRadius ?? allowed_radius ?? 30,
        semesterId: targetSemesterId,
        instructorId: instructorId || instructor_id ? Number(instructorId || instructor_id) : null,
        createdBy: Number(session.user.id),
      },
      include: {
        semester: true,
        instructor: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: course }, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create class" },
      { status: 500 }
    );
  }
}