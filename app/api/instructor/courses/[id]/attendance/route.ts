import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/libs/prisma";
import { AttendanceStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const courseId = Number(params.id);
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        semester: true,
        instructor: { select: { id: true, name: true, email: true } },
        enrollments: {
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 },
      );
    }

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        courseId,
        date: targetDate,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    const enrolledStudents = course.enrollments.map((e) => {
      const attRecord = attendances.find((a) => a.studentId === e.student.id);
      return {
        studentId: e.student.id,
        name: e.student.name,
        email: e.student.email,
        status: attRecord ? attRecord.status : "NOT_MARKED",
        timestamp: attRecord ? attRecord.timestamp : null,
        latitude: attRecord ? attRecord.latitude : null,
        longitude: attRecord ? attRecord.longitude : null,
        attendanceId: attRecord ? attRecord.id : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          code: course.code,
          room: course.room,
          dayOfWeek: course.dayOfWeek,
          startTime: course.startTime,
          endTime: course.endTime,
        },
        date: targetDate.toISOString().split("T")[0],
        students: enrolledStudents,
      },
    });
  } catch (error) {
    console.error("Error fetching instructor course attendance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance data" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const courseId = Number(params.id);
    const body = await req.json();
    const { studentId, status, date } = body;

    if (!studentId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields (studentId, status)",
        },
        { status: 400 },
      );
    }

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const validStatus = status.toUpperCase() as AttendanceStatus;

    const record = await prisma.attendance.upsert({
      where: {
        studentId_courseId_date: {
          studentId: Number(studentId),
          courseId,
          date: targetDate,
        },
      },
      update: {
        status: validStatus,
        timestamp: new Date(),
      },
      create: {
        studentId: Number(studentId),
        courseId,
        date: targetDate,
        status: validStatus,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Student status updated to ${validStatus}`,
      data: record,
    });
  } catch (error) {
    console.error("Error overriding student attendance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update attendance status" },
      { status: 500 },
    );
  }
}
