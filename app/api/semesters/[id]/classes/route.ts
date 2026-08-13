import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const semesterId = Number(params.id);
    if (!semesterId) {
      return NextResponse.json(
        { success: false, error: "Valid semester_id is required" },
        { status: 400 }
      );
    }

    const userId = Number(session.user.id);

    const courses = await prisma.course.findMany({
      where: { semesterId },
      orderBy: { title: "asc" },
      include: {
        instructor: { select: { id: true, name: true, email: true } },
        enrollments: {
          where: { studentId: userId },
          select: { id: true },
        },
      },
    });

    const result = courses.map((course) => {
      const isEnrolled = course.enrollments.length > 0;
      return {
        id: course.id,
        title: course.title,
        code: course.code,
        room: course.room,
        day_of_week: course.dayOfWeek,
        start_time: course.startTime,
        end_time: course.endTime,
        latitude: Number(course.latitude),
        longitude: Number(course.longitude),
        allowed_radius: course.allowedRadius,
        instructor: course.instructor,
        isEnrolled,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching classes for semester:", error);
    return NextResponse.json(
      { success: false, error: "Error fetching classes" },
      { status: 500 }
    );
  }
}
