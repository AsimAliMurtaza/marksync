import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const studentId = Number(session.user.id);

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            semester: true,
            instructor: { select: { id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    const enrolledCourses = enrollments.map((e) => ({
      ...e.course,
      enrolledAt: e.enrolledAt,
      schedule: {
        dayOfWeek: e.course.dayOfWeek,
        startTime: e.course.startTime,
        endTime: e.course.endTime,
        room: e.course.room,
      },
    }));

    return NextResponse.json({ success: true, data: enrolledCourses });
  } catch (error) {
    console.error("Error fetching enrolled classes:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrolled classes" },
      { status: 500 }
    );
  }
}
