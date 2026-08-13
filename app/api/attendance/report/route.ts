import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classIdParam = searchParams.get("classId") || searchParams.get("courseId");

    if (!classIdParam) {
      return NextResponse.json({ success: false, error: "Missing classId" }, { status: 400 });
    }

    const courseId = Number(classIdParam);

    const courseData = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!courseData) {
      return NextResponse.json({ success: false, error: "Class not found" }, { status: 404 });
    }

    const attendances = await prisma.attendance.findMany({
      where: { courseId },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: "asc" },
    });

    const enrolledStudents = courseData.enrollments.map((e) => e.student);

    const datesSet = new Set<string>();
    attendances.forEach((a) => {
      datesSet.add(a.date.toISOString().split("T")[0]);
    });
    const dates = Array.from(datesSet).sort();

    const report = enrolledStudents.map((student) => {
      const row: Record<string, string> = {
        Student: student.name,
        Email: student.email,
      };

      let presentCount = 0;
      dates.forEach((dateStr) => {
        const record = attendances.find(
          (a) =>
            a.studentId === student.id &&
            a.date.toISOString().split("T")[0] === dateStr
        );
        if (record) {
          row[dateStr] = record.status;
          if (record.status === "PRESENT") presentCount++;
        } else {
          row[dateStr] = "ABSENT";
        }
      });

      row["Total Classes"] = String(dates.length);
      row["Present Count"] = String(presentCount);
      row["Percentage"] = dates.length > 0 ? `${Math.round((presentCount / dates.length) * 100)}%` : "N/A";

      return row;
    });

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: courseData.id,
          title: courseData.title,
          code: courseData.code,
        },
        report,
        dates,
        totalEnrolled: enrolledStudents.length,
      },
    });
  } catch (err) {
    console.error("Error generating attendance report:", err);
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 });
  }
}