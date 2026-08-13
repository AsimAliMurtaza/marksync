import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = Number(params.id);
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
      instructor_id,
      instructorId,
    } = body;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title && { title: title.trim() }),
        ...(code && { code: code.trim().toUpperCase() }),
        ...(room && { room: room.trim() }),
        ...((dayOfWeek || day_of_week) && { dayOfWeek: dayOfWeek || day_of_week }),
        ...((startTime || start_time) && { startTime: startTime || start_time }),
        ...((endTime || end_time) && { endTime: endTime || end_time }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...((allowedRadius !== undefined || allowed_radius !== undefined) && {
          allowedRadius: allowedRadius ?? allowed_radius,
        }),
        ...(instructorId !== undefined || instructor_id !== undefined
          ? { instructorId: instructorId || instructor_id ? Number(instructorId || instructor_id) : null }
          : {}),
      },
      include: {
        semester: true,
        instructor: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update class" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = Number(params.id);
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
