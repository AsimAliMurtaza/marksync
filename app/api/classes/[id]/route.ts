import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = Number(params.id);

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Valid course ID is required" },
        { status: 400 }
      );
    }

    const courseData = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        semester: true,
        instructor: { select: { id: true, name: true, email: true } },
      },
    });

    if (!courseData) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const formattedCourse = {
      ...courseData,
      _id: String(courseData.id),
      name: courseData.title,
      allowedRadius: courseData.allowedRadius,
      schedule: {
        dayOfWeek: courseData.dayOfWeek,
        startTime: courseData.startTime,
        endTime: courseData.endTime,
        room: courseData.room,
      },
      location: {
        latitude: Number(courseData.latitude),
        longitude: Number(courseData.longitude),
      },
    };

    return NextResponse.json({ success: true, data: formattedCourse });
  } catch (error) {
    console.error("Error fetching course detail:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
